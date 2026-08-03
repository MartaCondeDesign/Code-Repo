import readline from "node:readline";
import https from "node:https";

const TOOLS = [
  {
    name: "github_fetch_tree",
    description: "Fetch complete repository file tree via GitHub API (fast & lightweight, 1 API call).",
    inputSchema: {
      type: "object",
      properties: {
        repoUrl: { type: "string", description: "GitHub repo URL (e.g. https://github.com/primer/react or owner/repo)" },
        token: { type: "string", description: "Optional GitHub Personal Access Token for private repositories" },
        branch: { type: "string", description: "Branch name (default: main or master)" }
      },
      required: ["repoUrl"]
    }
  },
  {
    name: "github_fetch_files",
    description: "Fetch specific file contents from GitHub repository on demand.",
    inputSchema: {
      type: "object",
      properties: {
        repoUrl: { type: "string", description: "GitHub repo URL" },
        paths: { type: "array", items: { type: "string" }, description: "Array of relative file paths to fetch (e.g. ['package.json', 'README.md'])" },
        token: { type: "string", description: "Optional GitHub Personal Access Token" },
        branch: { type: "string", description: "Branch name (default: main)" }
      },
      required: ["repoUrl", "paths"]
    }
  },
  {
    name: "analyze_design_system",
    description: "Run Design System contract rules (.md specifications) against repository files.",
    inputSchema: {
      type: "object",
      properties: {
        files: { type: "array", items: { type: "string" }, description: "Array of repository file paths" },
        fileContents: { type: "object", description: "Map of file path to file string content" },
        repoName: { type: "string", description: "Repository name" },
        repoUrl: { type: "string", description: "Repository URL" }
      },
      required: ["files", "fileContents"]
    }
  },
  {
    name: "generate_project_guide",
    description: "Generate structured Project Guide payload with capped metrics (200 max per category) and external documentation links.",
    inputSchema: {
      type: "object",
      properties: {
        analysis: { type: "object", description: "Output from analyze_design_system tool" },
        lang: { type: "string", description: "Language code ('es' or 'en', default 'es')" }
      },
      required: ["analysis"]
    }
  }
];

// Helper to parse owner and repo from URL or owner/repo format
function parseRepoOwnerName(repoUrl) {
  const cleaned = repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\.git$/i, "").replace(/\/$/, "");
  const parts = cleaned.split("/");
  return { owner: parts[0] || "", repo: parts[1] || "" };
}

// HTTP request helper
function httpGet(url, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      headers: {
        "User-Agent": "Antigravity-DesignSystem-MCP/1.0",
        "Accept": "application/vnd.github.v3+json"
      }
    };
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", (err) => reject(err));
    req.end();
  });
}

// Tool Implementation 1: Fetch Tree
async function handleFetchTree({ repoUrl, token, branch }) {
  const { owner, repo } = parseRepoOwnerName(repoUrl);
  if (!owner || !repo) throw new Error("Invalid GitHub repository format");

  const targetBranch = branch || "main";
  let url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`;
  
  try {
    const data = await httpGet(url, token);
    const files = (data.tree || []).filter(item => item.type === "blob").map(item => item.path);
    return {
      repoOwner: owner,
      repoName: repo,
      branch: targetBranch,
      treeCount: files.length,
      files,
      truncated: Boolean(data.truncated)
    };
  } catch (err) {
    if (err.message.includes("404") && !branch) {
      // Try fallback to 'master' branch
      url = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
      const data = await httpGet(url, token);
      const files = (data.tree || []).filter(item => item.type === "blob").map(item => item.path);
      return {
        repoOwner: owner,
        repoName: repo,
        branch: "master",
        treeCount: files.length,
        files,
        truncated: Boolean(data.truncated)
      };
    }
    throw err;
  }
}

// Tool Implementation 2: Fetch Files
async function handleFetchFiles({ repoUrl, paths, token, branch }) {
  const { owner, repo } = parseRepoOwnerName(repoUrl);
  const targetBranch = branch || "main";
  const fileContents = {};

  for (const filePath of paths) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${targetBranch}/${filePath}`;
    try {
      const content = await httpGet(rawUrl, token);
      fileContents[filePath] = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    } catch {
      fileContents[filePath] = "";
    }
  }

  return { repoOwner: owner, repoName: repo, fileContents };
}

// Tool Implementation 3: Contract Analyzer
function handleAnalyzeDesignSystem({ files = [], fileContents = {}, repoName = "project", repoUrl = "" }) {
  const MAX_CAP = 200;

  // Icon detection known packages
  const KNOWN_ICON_PACKAGES = [
    { name: "Octicons", pkg: "@primer/octicons-react", pattern: /@primer\/octicons-react|@primer\/octicons|octicons/i, url: "https://primer.style/octicons/" },
    { name: "Lucide", pkg: "lucide-react", pattern: /lucide-react|lucide-vue|lucide-svelte|lucide/i, url: "https://lucide.dev" },
    { name: "Heroicons", pkg: "@heroicons/react", pattern: /@heroicons\/react|@heroicons\/vue|heroicons/i, url: "https://heroicons.com" },
    { name: "Phosphor Icons", pkg: "@phosphor-icons/react", pattern: /@phosphor-icons\/react|@phosphor-icons\/vue|phosphor-icons/i, url: "https://phosphoricons.com" },
    { name: "Radix Icons", pkg: "@radix-ui/react-icons", pattern: /@radix-ui\/react-icons|radix-icons/i, url: "https://icons.radix-ui.com" },
    { name: "Feather Icons", pkg: "feather-icons", pattern: /feather-icons|react-feather/i, url: "https://feathericons.com" },
    { name: "Remix Icon", pkg: "remixicon", pattern: /remixicon|remixicon-react|remix-icon/i, url: "https://remixicon.com" },
    { name: "Tabler Icons", pkg: "@tabler/icons-react", pattern: /@tabler\/icons-react|tabler-icons/i, url: "https://tabler-icons.io" },
    { name: "Bootstrap Icons", pkg: "bootstrap-icons", pattern: /bootstrap-icons|react-bootstrap-icons/i, url: "https://icons.getbootstrap.com" },
    { name: "Font Awesome", pkg: "@fortawesome/react-fontawesome", pattern: /@fortawesome\/react-fontawesome|fontawesome|font-awesome/i, url: "https://fontawesome.com" },
    { name: "Material Icons", pkg: "@mui/icons-material", pattern: /@mui\/icons-material|material-symbols|material-icons/i, url: "https://mui.com" },
  ];

  const EXCLUDED_ASSET_PATTERN = /(?:logo|brand|partner|wordmark|illustration|marketing|artwork|banner|hero|photo|screenshot|empty-state|favicon|apple-touch-icon|app-icon|launcher)/i;

  let externalLib = null;
  let externalDocUrl = null;

  // Scan package.json
  const pkgJson = files.find(f => f.endsWith("package.json"));
  if (pkgJson && fileContents[pkgJson]) {
    for (const item of KNOWN_ICON_PACKAGES) {
      if (item.pattern.test(fileContents[pkgJson])) {
        externalLib = item;
        break;
      }
    }
  }

  // Scan READMEs
  const readmeFiles = files.filter(f => /(^|\/)(readme|contributing|architecture)\.(md|mdx)$/i.test(f));
  for (const rf of readmeFiles) {
    const content = fileContents[rf] || "";
    if (!externalDocUrl) {
      const docMatch = content.match(/https?:\/\/[^\s)>"'\]]*(?:primer\.style[^\s)>"'\]]*|zeroheight\.com|supernova\.io|knapsack\.cloud|[^\s)>"'\]]+\.design[^\s)>"'\]]*|[^\s)>"'\]]+\.style[^\s)>"'\]]*|[^\s)>"'\]]*ds\.[^\s)>"'\]]+|[^\s)>"'\]]*design-system[^\s)>"'\]]*)/i);
      if (docMatch) externalDocUrl = docMatch[0].replace(/[,.)]+$/, "");
    }
    if (!externalLib) {
      for (const item of KNOWN_ICON_PACKAGES) {
        if (item.pattern.test(content)) {
          externalLib = item;
          break;
        }
      }
    }
  }

  // Internal icon files
  const internalIconFiles = files.filter(f => {
    const lower = f.toLowerCase();
    if (EXCLUDED_ASSET_PATTERN.test(lower)) return false;
    const isSvg = lower.endsWith(".svg");
    const isIconDir = /(?:^|\/)(?:icons?|iconography|assets\/icons?|src\/icons?)(\/|$)/i.test(lower);
    const isIconFile = /(?:^|\/)[A-Za-z0-9_-]*icon[A-Za-z0-9_-]*\.(tsx?|jsx?|vue|svelte|svg)$/i.test(lower);
    return isIconDir || isIconFile || (isSvg && !lower.includes("logo") && !lower.includes("banner"));
  });

  // Category counts & capping (max 200 items per category)
  const componentFiles = files.filter(f => /(^|\/)(components?|ui)\//i.test(f) && /\.(tsx?|jsx?|vue|svelte)$/i.test(f));
  const tokenFiles = files.filter(f => /(^|\/)(tokens?|design-tokens?|variables?|theme[s]?|palette|colors?|spacing|typography)\./i.test(f));
  const docFiles = files.filter(f => /(^|\/)docs?\//i.test(f) || /(^|\/)(readme|contributing|guidelines?)\.(md|mdx)$/i.test(f));

  return {
    repoName,
    repoUrl,
    components: {
      total: componentFiles.length,
      capped: componentFiles.length > MAX_CAP,
      displayFiles: componentFiles.slice(0, MAX_CAP)
    },
    tokens: {
      total: tokenFiles.length,
      capped: tokenFiles.length > MAX_CAP,
      displayFiles: tokenFiles.slice(0, MAX_CAP)
    },
    docs: {
      total: docFiles.length,
      capped: docFiles.length > MAX_CAP,
      displayFiles: docFiles.slice(0, MAX_CAP)
    },
    icons: {
      total: internalIconFiles.length,
      capped: internalIconFiles.length > MAX_CAP,
      displayFiles: internalIconFiles.slice(0, MAX_CAP),
      externalLibrary: externalLib ? externalLib.name : null,
      externalUrl: externalLib ? externalLib.url : null,
      externalDocUrl: externalDocUrl || null
    }
  };
}

// Tool Implementation 4: Project Guide Payload Generator
function handleGenerateProjectGuide({ analysis, lang = "es" }) {
  const isEs = lang === "es";
  return {
    summary: {
      repoName: analysis.repoName,
      status: isEs ? "Sistema de diseño analizado mediante MCP" : "Design system analyzed via MCP",
      metrics: [
        {
          label: isEs ? "Componentes" : "Components",
          value: analysis.components.total,
          capped: analysis.components.capped,
          badge: analysis.components.capped ? "+" : ""
        },
        {
          label: "Tokens",
          value: analysis.tokens.total,
          capped: analysis.tokens.capped,
          badge: analysis.tokens.capped ? "+" : ""
        },
        {
          label: isEs ? "Documentación" : "Documentation",
          value: analysis.docs.total,
          capped: analysis.docs.capped,
          badge: analysis.docs.capped ? "+" : ""
        },
        {
          label: isEs ? "Iconos" : "Icons",
          value: analysis.icons.total,
          capped: analysis.icons.capped,
          badge: analysis.icons.capped ? "+" : ""
        }
      ],
      information: {
        externalDocUrl: analysis.icons.externalDocUrl,
        externalIconLibrary: analysis.icons.externalLibrary,
        externalIconUrl: analysis.icons.externalUrl
      }
    }
  };
}

// MCP JSON-RPC Server Loop (stdio)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on("line", async (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === "initialize") {
      sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "design-system-analyzer-mcp", version: "1.0.0" }
      });
      return;
    }

    if (method === "tools/list") {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params;
      let result;

      if (name === "github_fetch_tree") {
        result = await handleFetchTree(args || {});
      } else if (name === "github_fetch_files") {
        result = await handleFetchFiles(args || {});
      } else if (name === "analyze_design_system") {
        result = handleAnalyzeDesignSystem(args || {});
      } else if (name === "generate_project_guide") {
        result = handleGenerateProjectGuide(args || {});
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      sendResponse(id, {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) }
        ]
      });
      return;
    }

    if (method === "notifications/initialized") {
      return; // No response required for initialization notification
    }

    sendResponse(id, null, { code: -32601, message: "Method not found" });
  } catch (err) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.id) {
        sendResponse(parsed.id, null, { code: -32603, message: err.message });
      }
    } catch { /* Ignore malformed JSON */ }
  }
});

function sendResponse(id, result, error = null) {
  const res = { jsonrpc: "2.0", id };
  if (error) res.error = error;
  else res.result = result;
  process.stdout.write(JSON.stringify(res) + "\n");
}
