import { analyzeFromData } from "../server/analyze.mjs";

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".nuxt", "coverage",
  ".cache", "out", ".turbo", ".vercel", "target", ".idea", ".vscode",
  "__pycache__", ".venv", "vendor", "ios", "android", "Pods", "DerivedData",
]);

function validateRepoUrl(input) {
  const text = (input || "").trim();
  try {
    const u = new URL(text);
    if (u.hostname === "github.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
      }
    }
  } catch {}
  const bare = /(?:gh\s+repo\s+clone\s+)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(text);
  if (bare) return { owner: bare[1], repo: bare[2].replace(/\.git$/, "") };
  return null;
}

async function fetchTree(owner, repo, token) {
  const headers = { "User-Agent": "dsmap-analyzer/1.0" };
  if (token) headers.Authorization = `Bearer ${token}`;

  for (const branch of ["HEAD", "main", "master"]) {
    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );
    if (r.status === 401 || r.status === 403) throw new Error("AUTH_REQUIRED");
    if (r.status === 404) continue;
    if (!r.ok) throw new Error(`GitHub API error: ${r.status}`);
    const d = await r.json();
    return d.tree.filter((t) => t.type === "blob").map((t) => t.path);
  }
  throw new Error("AUTH_REQUIRED");
}

async function fetchFileContents(owner, repo, files, token) {
  const FETCH_EXTS = /\.(json|js|jsx|ts|tsx|mjs|cjs|css|scss|sass|md|mdx|yaml|yml|html|vue|svelte|txt|toml)$/i;
  const maxTotalBytes = 2_000_000;
  const maxFileBytes = 120_000;

  const toFetch = files.filter((f) => {
    if (!FETCH_EXTS.test(f)) return false;
    return !f.split("/").some((p) => SKIP_DIRS.has(p));
  });

  const headers = { "User-Agent": "dsmap-analyzer/1.0" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const contents = {};
  let totalBytes = 0;

  const BATCH = 20;
  for (let i = 0; i < toFetch.length; i += BATCH) {
    if (totalBytes >= maxTotalBytes) break;
    const batch = toFetch.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (file) => {
        if (totalBytes >= maxTotalBytes) return;
        try {
          let text;
          if (token) {
            const r = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file)}`,
              { headers }
            );
            if (!r.ok) return;
            const d = await r.json();
            if (!d.content || d.size > maxFileBytes) return;
            text = Buffer.from(d.content.replace(/\n/g, ""), "base64").toString("utf8");
          } else {
            const r = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file}`
            );
            if (!r.ok) return;
            text = await r.text();
            if (text.length > maxFileBytes) return;
          }
          if (text.includes("\0")) return;
          contents[file] = text;
          totalBytes += text.length;
        } catch {}
      })
    );
  }

  return contents;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { repoUrl, path: subPath, token } = req.body || {};
  if (!repoUrl || typeof repoUrl !== "string") {
    res.status(400).json({ error: "Falta el campo repoUrl" });
    return;
  }

  const parsed = validateRepoUrl(repoUrl);
  if (!parsed) {
    res.status(400).json({ error: "URL inválida: usa https://github.com/usuario/repo" });
    return;
  }

  const { owner, repo } = parsed;

  try {
    let files = await fetchTree(owner, repo, token);

    if (subPath) {
      const prefix = subPath.endsWith("/") ? subPath : `${subPath}/`;
      const filtered = files
        .filter((f) => f.startsWith(prefix))
        .map((f) => f.slice(prefix.length));
      if (filtered.length === 0) {
        res.status(400).json({ error: `La carpeta "${subPath}" no existe en el repositorio.` });
        return;
      }
      files = filtered;
    }

    const fileContents = await fetchFileContents(owner, repo, files, token);
    const repoName = subPath ? `${repo}/${subPath}` : repo;
    const repoCanonicalUrl = `https://github.com/${owner}/${repo}`;

    const result = analyzeFromData(files, fileContents, repoName, repoCanonicalUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
