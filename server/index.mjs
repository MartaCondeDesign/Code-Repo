import http from "node:http";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { analyzeRepo } from "./analyze.mjs";

const execFileP = promisify(execFile);
const PORT = process.env.PORT || 4314;

function validateRepoUrl(input) {
  const text = (input || "").trim();
  let owner = null;
  let repo = null;

  try {
    const u = new URL(text);
    if (u.hostname === "github.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1].replace(/\.git$/, "");
      }
    }
  } catch {
    const ssh = /^(?:git@)?github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?$/.exec(text);
    if (ssh) {
      owner = ssh[1];
      repo = ssh[2];
    }
  }

  if (!owner && !repo) {
    const bare = /(?:gh\s+repo\s+clone\s+)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(text);
    if (bare) {
      owner = bare[1];
      repo = bare[2].replace(/\.git$/, "");
    }
  }

  if (!owner || !repo) return null;
  return { owner, repo };
}

async function cloneAndAnalyze(repoUrl, subPath, token) {
  const parsed = validateRepoUrl(repoUrl);
  if (!parsed) throw new Error("URL inválida: usa https://github.com/usuario/repo");
  const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), "dsmap-"));
  
  let cloneUrl = `https://github.com/${parsed.owner}/${parsed.repo}.git`;
  const trimmed = repoUrl.trim();
  if (token) {
    cloneUrl = `https://oauth2:${token}@github.com/${parsed.owner}/${parsed.repo}.git`;
  } else if (trimmed.startsWith("git@github.com") || trimmed.includes("github.com:")) {
    cloneUrl = `git@github.com:${parsed.owner}/${parsed.repo}.git`;
  } else {
    try {
      const u = new URL(trimmed);
      if (u.username || u.password) {
        cloneUrl = u.toString();
      }
    } catch {
      // Use fallback
    }
  }

  try {
    await execFileP("git", ["-c", "credential.helper=", "clone", "--depth", "1", "--quiet", cloneUrl, tmp], { timeout: 90000 });
  } catch (err) {
    await fs.promises.rm(tmp, { recursive: true, force: true });
    throw new Error("AUTH_REQUIRED");
  }
  const scanDir = subPath ? path.join(tmp, subPath) : tmp;
  if (subPath) {
    try {
      fs.statSync(scanDir);
    } catch {
      await fs.promises.rm(tmp, { recursive: true, force: true });
      throw new Error(`La carpeta "${subPath}" no existe en el repositorio.`);
    }
  }
  try {
    return analyzeRepo(scanDir, subPath ? `${parsed.repo}/${subPath}` : parsed.repo, `https://github.com/${parsed.owner}/${parsed.repo}`);
  } finally {
    await fs.promises.rm(tmp, { recursive: true, force: true });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/api/analyze") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { repoUrl, path: subPath, token } = JSON.parse(body || "{}");
        if (!repoUrl || typeof repoUrl !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Falta el campo repoUrl" }));
          return;
        }
        const result = await cloneAndAnalyze(repoUrl, subPath, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`ds-map analyzer listening on http://localhost:${PORT}`);
});
