import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".nuxt", "coverage",
  ".cache", "out", ".turbo", ".vercel", "target", ".idea", ".vscode",
  "__pycache__", ".venv", "vendor", "ios", "android", "Pods", "DerivedData",
]);

const CONTAINER_DIRS = new Set([
  "src", "components", "packages", "ui", "lib", "app", "core", "react",
  "frontend", "web", "source", "libs", "public",
  // Atomic design categories (each file inside gets its own node)
  "atoms", "molecules", "organisms", "primitives", "base", "elements",
  "generic", "common", "shared",
]);

// Directories that are never components — excluded from candidate scan
const UTILITY_DIRS = /(?:^|\/)(?:utils?|helpers?|hooks?|typings?|types?|constants?|contexts?|services?|api|store|stores?|configs?|assets|styles?|themes?|scripts?|middleware|guards?|directives?|adapters?|metadata|selectors?|reducers?|actions?|providers?|generators?|seeds?|migrations?)(\/|$)/i;

const TOP_LEVEL_BASENAMES = new Set([
  "main", "app", "index", "vite-env", "react-app-env", "reportWebVitals",
  "setupTests", "setup",
]);

const LAYER_DEFS = [
  { id: "rules", label: "Rules & Docs", color: "#a78bfa" },
  { id: "tokens", label: "Tokens", color: "#fbbf24" },
  { id: "icons", label: "Iconos", color: "#60a5fa" },
  { id: "components", label: "Components", color: "#34d399" },
  { id: "stories", label: "Stories", color: "#38bdf8" },
  { id: "scripts", label: "Scripts & Tooling", color: "#f472b6" },
  { id: "config", label: "Config & Infra", color: "#fb7185" },
];

const LAYER_SUB = {
  rules: ["Docs, reglas y skills de IA", "Docs, AI rules & skills"],
  tokens: ["Valores y definiciones del sistema", "System values and definitions"],
  icons: ["Iconos vectoriales y recursos visuales", "Vector icons and visual assets"],
  components: ["Código fuente del design system", "Design system source code"],
  stories: ["Variantes y props visibles", "Visible variants & props"],
  scripts: ["Automatización y tooling", "Automation & tooling"],
  config: ["Contratos y configuración", "Contracts & configuration"],
};

const VERB_COLORS = {
  defines: "#34d399",
  uses: "#fbbf24",
  imports: "#a78bfa",
  reads: "#38bdf8",
  writes: "#f472b6",
  orchestrates: "#fb7185",
};

const VERB_DEFS_ES = {
  defines: "Los stories definen las variantes y props del componente.",
  uses: "El componente importa y usa estos tokens del sistema.",
  imports: "Un componente importa otro componente del sistema.",
  reads: "El script lee configuración o datos para automatizar.",
  writes: "El script escribe o sincroniza artefactos.",
  orchestrates: "El documento o regla orquesta cómo se construye el sistema.",
};

const VERB_DEFS_EN = {
  defines: "The stories define the component's variants and props.",
  uses: "The component imports and uses these system tokens.",
  imports: "A component imports another system component.",
  reads: "The script reads configuration or data to automate.",
  writes: "The script writes or syncs artifacts.",
  orchestrates: "The document or rule orchestrates how the system is built.",
};

const SOURCE_EXT = /\.(tsx?|jsx?|mjs|vue|svelte)$/;
const CSS_EXT = /\.(css|scss|sass)$/;

export function analyzeRepo(repoDir, repoName, repoUrl) {
  const files = [];
  walk(repoDir, files, "");
  const fileSet = new Set(files);
  const fileContents = collectFileContents(repoDir, files);

  const components = collectComponents(files, repoDir);
  const tokens = files.filter(isTokenFile);
  const stories = collectStories(files);
  const scripts = collectScripts(files);
  const configFiles = files.filter(isConfigFile);
  const docs = collectDocs(files);
  const skills = collectSkills(files);

  const MAX_CATEGORY_NODES = 200;

  const componentTotal = components.length;
  const componentsCapped = componentTotal > MAX_CATEGORY_NODES;
  const displayComponents = componentsCapped ? components.slice(0, MAX_CATEGORY_NODES) : components;

  const tokenTotal = tokens.length;
  const tokensCapped = tokenTotal > MAX_CATEGORY_NODES;
  const displayTokens = tokensCapped ? tokens.slice(0, MAX_CATEGORY_NODES) : tokens;

  const nonRuleDocs = docs.filter((f) => !/^(agenta?|claude)\.md$/i.test(path.basename(f)));
  const docTotal = nonRuleDocs.length;
  const docsCapped = docTotal > MAX_CATEGORY_NODES;
  const displayDocs = docsCapped ? nonRuleDocs.slice(0, MAX_CATEGORY_NODES) : nonRuleDocs;

  const iconAnalysis = detectIcons(files, fileContents);
  const internalIcons = iconAnalysis.internalIconFiles || [];
  const displayIcons = internalIcons.length > MAX_CATEGORY_NODES ? internalIcons.slice(0, MAX_CATEGORY_NODES) : internalIcons;

  const raw = [];
  for (const s of skills) raw.push(skillNode(s));
  const ruleFiles = configFiles.filter((f) => /^(agenta?|claude)\.md$/i.test(path.basename(f)));
  if (ruleFiles.length > 0) raw.push(ruleNode(ruleFiles));
  for (const d of displayDocs) raw.push(docNode(d));
  for (const t of displayTokens) raw.push(tokenNode(t));
  for (const iconFile of displayIcons) raw.push(iconNode(iconFile));
  for (const c of displayComponents) raw.push(componentNode(c));
  for (const s of stories) raw.push(storyNode(s, components));
  for (const s of scripts) raw.push(scriptNode(s));
  for (const f of configFiles.filter((f) => !/^(agenta?|claude)\.md$/i.test(path.basename(f)))) raw.push(configNode(f));

  const nodes = assignIds(raw);
  const fileToNode = new Map();
  for (const n of nodes) for (const f of n.files) fileToNode.set(f, n);

  const edges = buildEdges(nodes, fileToNode, fileSet, repoDir);

  const usedLayerIds = new Set(nodes.map((n) => n.layer));
  const layers = LAYER_DEFS.filter((l) => usedLayerIds.has(l.id)).map((l) => {
    const [subEs, subEn] = LAYER_SUB[l.id];
    return { id: l.id, label: l.label, color: l.color, sub: subEs, sub_en: subEn };
  });

  const verbs = new Set(edges.map((e) => e.verb));
  const iconAnalysis = detectIcons(files, fileContents);

  return {
    repoName,
    repoUrl,
    files: files.slice(0, 4000),
    fileContents,
    layers,
    nodes,
    edges,
    componentTotal,
    componentsCapped,
    tokenTotal,
    tokensCapped,
    docTotal,
    docsCapped,
    iconAnalysis,
    verbDefs: {
      es: Object.fromEntries([...verbs].map((v) => [v, VERB_DEFS_ES[v] || v])),
      en: Object.fromEntries([...verbs].map((v) => [v, VERB_DEFS_EN[v] || v])),
    },
  };
}

const KNOWN_ICON_PACKAGES = [
  { name: "Octicons", pkg: "@primer/octicons-react", pattern: /@primer\/octicons-react|@primer\/octicons|octicons/i },
  { name: "Lucide", pkg: "lucide-react", pattern: /lucide-react|lucide-vue|lucide-svelte|lucide/i },
  { name: "Heroicons", pkg: "@heroicons/react", pattern: /@heroicons\/react|@heroicons\/vue|heroicons/i },
  { name: "Phosphor Icons", pkg: "@phosphor-icons/react", pattern: /@phosphor-icons\/react|@phosphor-icons\/vue|phosphor-icons/i },
  { name: "Radix Icons", pkg: "@radix-ui/react-icons", pattern: /@radix-ui\/react-icons|radix-icons/i },
  { name: "Feather Icons", pkg: "feather-icons", pattern: /feather-icons|react-feather/i },
  { name: "Remix Icon", pkg: "remixicon", pattern: /remixicon|remixicon-react|remix-icon/i },
  { name: "Tabler Icons", pkg: "@tabler/icons-react", pattern: /@tabler\/icons-react|tabler-icons/i },
  { name: "Bootstrap Icons", pkg: "bootstrap-icons", pattern: /bootstrap-icons|react-bootstrap-icons/i },
  { name: "Iconoir", pkg: "iconoir", pattern: /iconoir|iconoir-react/i },
  { name: "Carbon Icons", pkg: "@carbon/icons", pattern: /@carbon\/icons|@carbon\/icons-react/i },
  { name: "Fluent UI Icons", pkg: "@fluentui/react-icons", pattern: /@fluentui\/react-icons/i },
  { name: "Font Awesome", pkg: "@fortawesome/react-fontawesome", pattern: /@fortawesome\/react-fontawesome|fontawesome|font-awesome/i },
  { name: "Material Icons", pkg: "@mui/icons-material", pattern: /@mui\/icons-material|material-symbols|material-icons/i },
  { name: "Ant Design Icons", pkg: "@ant-design/icons", pattern: /@ant-design\/icons/i },
  { name: "Chakra UI Icons", pkg: "@chakra-ui/icons", pattern: /@chakra-ui\/icons/i },
];

const EXCLUDED_ASSET_PATTERN = /(?:logo|brand|partner|wordmark|illustration|marketing|artwork|banner|hero|photo|screenshot|empty-state|favicon|apple-touch-icon|app-icon|launcher)/i;

export function detectIcons(files, fileContents) {
  let externalLib = null;
  let externalDocUrl = null;
  const packageJsonFile = files.find((f) => f.endsWith("package.json"));
  const readmeFiles = files.filter((f) => /(^|\/)(readme|contributing|architecture|guidelines?)\.(md|mdx)$/i.test(f));

  // 1. Scan package.json for official package dependencies & documentation URL
  if (packageJsonFile && fileContents[packageJsonFile]) {
    const content = fileContents[packageJsonFile];
    try {
      const pkgObj = JSON.parse(content);
      const hp = pkgObj.homepage || pkgObj.documentation;
      if (hp && typeof hp === "string" && /^https?:\/\//i.test(hp) && !hp.includes("github.com") && !hp.includes("shields.io") && !hp.includes("badge") && !/\.(svg|png|jpg|jpeg|gif)$/i.test(hp)) {
        externalDocUrl = hp.replace(/[,.)]+$/, "");
      }
    } catch {}

    for (const item of KNOWN_ICON_PACKAGES) {
      if (item.pattern.test(content)) {
        externalLib = { name: item.name, pkg: item.pkg, evidenceFile: packageJsonFile };
        break;
      }
    }
  }

  // 2. Scan README / MD files for icon library mentions and external documentation links
  for (const readmeFile of readmeFiles) {
    const content = fileContents[readmeFile] || "";
    if (!content) continue;

    if (!externalDocUrl || externalDocUrl.includes("shields.io")) {
      // 1. Check for linked badges: [![badge](IMAGE_URL)](DESTINATION_URL)
      const linkedBadgeMatch = content.match(/\[!\[[^\]]*\]\((https?:\/\/[^\s)>"'\]]+)\)\]\((https?:\/\/[^\s)>"'\]]+)\)/i);
      if (linkedBadgeMatch && linkedBadgeMatch[2]) {
        const destUrl = linkedBadgeMatch[2].replace(/[,.)]+$/, "");
        if (!destUrl.includes("github.com") && !destUrl.includes("shields.io") && !/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(destUrl)) {
          externalDocUrl = destUrl;
        }
      }

      // 2. Check for HTML linked images: <a href="DESTINATION_URL"><img src="IMAGE_URL"></a>
      if (!externalDocUrl || externalDocUrl.includes("shields.io")) {
        const htmlLinkMatch = content.match(/<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>[\s\S]*?<img/i);
        if (htmlLinkMatch && htmlLinkMatch[1]) {
          const destUrl = htmlLinkMatch[1].replace(/[,.)]+$/, "");
          if (!destUrl.includes("github.com") && !destUrl.includes("shields.io") && !/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(destUrl)) {
            externalDocUrl = destUrl;
          }
        }
      }

      // 3. Fallback: Look for dedicated company/DS domains (atmeta.com, primer.style, etc.) or explicit Markdown links
      if (!externalDocUrl || externalDocUrl.includes("shields.io")) {
        const dedicatedDomainMatch = content.match(/https?:\/\/[^\s)>"'\]]*(?:atmeta\.com|primer\.style|zeroheight\.com|supernova\.io|knapsack\.cloud|[^\s)>"'\]]+\.design|[^\s)>"'\]]+\.style)[^\s)>"'\]]*/i);
        if (dedicatedDomainMatch && !dedicatedDomainMatch[0].includes("shields.io") && !/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(dedicatedDomainMatch[0])) {
          externalDocUrl = dedicatedDomainMatch[0].replace(/[,.)]+$/, "");
        } else {
          const mdDocMatch = content.match(/\[(?:documentation|docs|getting\s+started|guide|website|official\s+site)[^\]]*\]\((https?:\/\/[^\s)>"'\]]+)\)/i);
          if (mdDocMatch && !mdDocMatch[1].includes("github.com") && !mdDocMatch[1].includes("shields.io") && !/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(mdDocMatch[1])) {
            externalDocUrl = mdDocMatch[1].replace(/[,.)]+$/, "");
          } else {
            const docsPathMatch = content.match(/https?:\/\/[^\s)>"'\]]+\/(?:docs|getting-started)(?:\/[^\s)>"'\]]*)?/i);
            if (docsPathMatch && !docsPathMatch[0].includes("github.com") && !docsPathMatch[0].includes("shields.io") && !docsPathMatch[0].includes("npmjs.com") && !/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(docsPathMatch[0])) {
              externalDocUrl = docsPathMatch[0].replace(/[,.)]+$/, "");
            }
          }
        }
      }
    }

    // Scan README for icon library mentions if not found in package.json
    if (!externalLib) {
      for (const item of KNOWN_ICON_PACKAGES) {
        const readmePattern = new RegExp(`(?:icons?\\s+(?:from|by|using|with)|library|pack|set)?[\\s:]*${item.name}`, "i");
        if (readmePattern.test(content) || item.pattern.test(content)) {
          externalLib = { name: item.name, pkg: item.pkg, evidenceFile: readmeFile };
          break;
        }
      }
    }
  }

  // 3. Fallback scan across all repository files for official documentation links (e.g. atmeta.com, primer.style)
  if (!externalDocUrl || externalDocUrl.includes("shields.io")) {
    for (const [filePath, content] of Object.entries(fileContents || {})) {
      if (!content || typeof content !== "string") continue;
      const atmetaMatch = content.match(/https?:\/\/[^\s)>"'\]]*atmeta\.com[^\s)>"'\]]*/i);
      if (atmetaMatch) {
        externalDocUrl = atmetaMatch[0].replace(/[,.)]+$/, "");
        break;
      }
      const dedicatedMatch = content.match(/https?:\/\/[^\s)>"'\]]*(?:primer\.style|zeroheight\.com|supernova\.io|knapsack\.cloud|[^\s)>"'\]]+\.design|[^\s)>"'\]]+\.style)[^\s)>"'\]]*/i);
      if (dedicatedMatch && !dedicatedMatch[0].includes("shields.io")) {
        externalDocUrl = dedicatedMatch[0].replace(/[,.)]+$/, "");
        break;
      }
    }
  }

  // 4. Sanitize externalDocUrl if it came from a shield badge URL
  if (externalDocUrl && externalDocUrl.includes("shields.io")) {
    const badgeMatch = externalDocUrl.match(/badge\/(?:Docs|Documentation)-([a-z0-9.-]+)/i);
    if (badgeMatch && badgeMatch[1]) {
      const cleanDomain = badgeMatch[1].replace(/-[0-9a-fA-F]{3,8}$/, "");
      externalDocUrl = `https://${cleanDomain}/docs/getting-started`;
    } else {
      externalDocUrl = null;
    }
  }

  // 3. Scan code file imports if external library still not found
  if (!externalLib) {
    for (const [filePath, content] of Object.entries(fileContents || {})) {
      for (const item of KNOWN_ICON_PACKAGES) {
        if (item.pattern.test(content)) {
          externalLib = { name: item.name, pkg: item.pkg, evidenceFile: filePath };
          break;
        }
      }
      if (externalLib) break;
    }
  }

  // 4. Scan internal SVG & icon component files
  const internalIconFiles = files.filter((f) => {
    const lower = f.toLowerCase();
    // IconButton is a UI Component, NOT an icon
    if (/iconbutton/i.test(lower)) return false;
    if (EXCLUDED_ASSET_PATTERN.test(lower)) return false;
    const isSvg = lower.endsWith(".svg");
    const isIconDir = /(?:^|\/)(?:icons?|iconography|assets\/icons?|src\/icons?)(\/|$)/i.test(lower);
    const isIconFile = /(?:^|\/)[A-Za-z0-9_-]*icon[A-Za-z0-9_-]*\.(tsx?|jsx?|vue|svelte|svg)$/i.test(lower);
    return isIconDir || isIconFile || (isSvg && !lower.includes("logo") && !lower.includes("banner"));
  });

  const hasInternal = internalIconFiles.length > 0;
  const hasExternal = Boolean(externalLib);

  let hasIcons = "No";
  let sourceModel = "Unknown";
  let confidence = "Low";
  let primaryEvidenceFile = "None";
  let iconSource = "None";
  let officialIconCount = "0";

  if (hasInternal && hasExternal) {
    hasIcons = "Yes";
    sourceModel = "Mixed";
    confidence = "High";
    primaryEvidenceFile = internalIconFiles.find((f) => /index\.(tsx?|jsx?|ts|js)/i.test(f)) || externalLib.evidenceFile || internalIconFiles[0];
    iconSource = `Internal (${internalIconFiles.length} files) + ${externalLib.name}`;
    officialIconCount = `At least ${internalIconFiles.length}`;
  } else if (hasInternal) {
    hasIcons = "Yes";
    sourceModel = "Internal";
    confidence = "High";
    primaryEvidenceFile = internalIconFiles.find((f) => /index\.(tsx?|jsx?|ts|js)/i.test(f)) || internalIconFiles[0];
    iconSource = internalIconFiles[0].includes("/") ? internalIconFiles[0].split("/").slice(0, -1).join("/") : "Local repository";
    officialIconCount = String(internalIconFiles.length);
  } else if (hasExternal) {
    hasIcons = "Yes";
    sourceModel = "External";
    confidence = "High";
    const wrapper = files.find((f) => /(?:^|\/)Icon\.(tsx?|jsx?|vue|svelte)$/i.test(f)) || files.find((f) => /icons?\.(tsx?|jsx?|ts|js)$/i.test(f));
    primaryEvidenceFile = wrapper || externalLib.evidenceFile;
    iconSource = `${externalLib.name} (${externalLib.pkg})`;
    officialIconCount = "Unknown";
  }

  return {
    hasIcons,
    sourceModel,
    confidence,
    primaryEvidenceFile,
    iconSource,
    officialIconCount,
    iconTotal: internalIconFiles.length,
    iconsCapped: internalIconFiles.length > 200,
    internalIconFiles: internalIconFiles.slice(0, 200),
    externalLibrary: externalLib ? externalLib.name : "None",
    externalPackage: externalLib ? externalLib.pkg : "None",
    externalDocUrl: externalDocUrl || null,
  };
}

/* ---------------- filesystem ---------------- */

function collectFileContents(repoDir, files) {
  const contents = {};
  let totalBytes = 0;
  const maxTotalBytes = 2_000_000;
  const maxFileBytes = 120_000;
  for (const file of files) {
    if (totalBytes >= maxTotalBytes) break;
    try {
      const fullPath = path.join(repoDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.size > maxFileBytes) continue;
      const buffer = fs.readFileSync(fullPath);
      if (buffer.includes(0)) continue;
      const text = buffer.toString("utf8");
      contents[file] = text;
      totalBytes += Buffer.byteLength(text);
    } catch {
      // A file can disappear or be unreadable while a repository is scanned.
    }
  }
  return contents;
}

function walk(dir, out, rel) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), out, rel ? `${rel}/${e.name}` : e.name);
    } else if (e.isFile()) {
      out.push(rel ? `${rel}/${e.name}` : e.name);
    }
  }
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function baseName(file) {
  return path.basename(file, path.extname(file));
}

function dirName(file) {
  const d = path.posix.dirname(file);
  return d === "." ? "root" : d;
}

function cap(arr, n) {
  return arr.length > n ? arr.slice(0, n) : arr;
}

/* ---------------- collection ---------------- */

/* ---- Barrel-based component inventory (Contract: detect-component-inventory.md) ---- */

function findBarrelCandidates(files) {
  return files
    .filter((f) => {
      const name = path.basename(f);
      if (!/^index\.[tj]sx?$/.test(name)) return false;
      if (/(^|\/)(__tests__|__mocks__|e2e|examples?|\.storybook)(\/|$)/i.test(f)) return false;
      if (UTILITY_DIRS.test(f)) return false;
      return true;
    })
    .sort((a, b) => {
      // Shallowest paths first (most likely to be public entry points)
      const diff = a.split("/").length - b.split("/").length;
      if (diff !== 0) return diff;
      // Prefer paths containing 'src'
      return (a.includes("/src/") ? 0 : 1) - (b.includes("/src/") ? 0 : 1);
    });
}

function resolveSourceFile(name, importPath, barrelDir, fileSet) {
  const clean = importPath.replace(/^\.\//, "");
  const base = barrelDir ? `${barrelDir}/${clean}` : clean;
  const normalized = path.posix.normalize(base);
  for (const ext of [".tsx", ".jsx", ".ts", ".js"]) {
    if (fileSet.has(`${normalized}/${name}${ext}`)) return `${normalized}/${name}${ext}`;
  }
  for (const ix of ["index.tsx", "index.ts", "index.jsx", "index.js"]) {
    if (fileSet.has(`${normalized}/${name}/${ix}`)) return `${normalized}/${name}/${ix}`;
    if (fileSet.has(`${normalized}/${ix}`)) return `${normalized}/${ix}`;
  }
  for (const ext of [".tsx", ".jsx", ".ts", ".js"]) {
    if (fileSet.has(`${normalized}${ext}`)) return `${normalized}${ext}`;
  }
  return null;
}

function parseComponentExports(content, barrelDir, fileSet, repoDir, depth) {
  // Strip type-only export lines before parsing
  const stripped = content.replace(/^\s*export\s+type\s+\{[^}]*\}[^;\n]*[;\n]/gm, "");
  const components = new Map();

  // export { Button, Input } from './path'
  const namedRe = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = namedRe.exec(stripped))) {
    const fromPath = m[2];
    const names = m[1]
      .split(",")
      .map((n) => n.trim().replace(/.*?\bas\s+/, "").trim())
      .filter((n) => /^[A-Z][a-zA-Z]/.test(n));
    for (const name of names) {
      if (!components.has(name)) {
        const src = resolveSourceFile(name, fromPath, barrelDir, fileSet);
        const fallback = barrelDir ? `${barrelDir}/${fromPath.replace(/^\.\//, "")}` : fromPath;
        components.set(name, { name, files: [src || fallback] });
      }
    }
  }

  // export * from './path'  — follow one level deep when repoDir provided
  if (depth > 0 && repoDir) {
    const wildcardRe = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
    while ((m = wildcardRe.exec(stripped))) {
      const fromPath = m[1];
      const clean = fromPath.replace(/^\.\//, "");
      const base = barrelDir ? `${barrelDir}/${clean}` : clean;
      const normalized = path.posix.normalize(base);
      let subFile = null;
      for (const ix of ["index.tsx", "index.ts", "index.jsx", "index.js"]) {
        if (fileSet.has(`${normalized}/${ix}`)) { subFile = `${normalized}/${ix}`; break; }
        if (fileSet.has(`${normalized}.ts`)) { subFile = `${normalized}.ts`; break; }
        if (fileSet.has(`${normalized}.tsx`)) { subFile = `${normalized}.tsx`; break; }
      }
      if (!subFile) continue;
      try {
        const stat = fs.statSync(path.join(repoDir, subFile));
        if (stat.size > 100_000) continue;
        const subContent = fs.readFileSync(path.join(repoDir, subFile), "utf8");
        const subDir = subFile.split("/").slice(0, -1).join("/");
        const subComponents = parseComponentExports(subContent, subDir, fileSet, null, 0);
        for (const c of subComponents) {
          if (!components.has(c.name)) components.set(c.name, c);
        }
      } catch { /* unreadable */ }
    }
  }

  // export const/function/class PascalCase (direct implementations in the barrel)
  const directRe = /^export\s+(?:const|function|class)\s+([A-Z][a-zA-Z]+)/mg;
  while ((m = directRe.exec(stripped))) {
    if (!components.has(m[1])) {
      const fallback = barrelDir ? `${barrelDir}/index` : "index";
      components.set(m[1], { name: m[1], files: [fallback] });
    }
  }

  return [...components.values()];
}

function collectFromBarrel(files, repoDir) {
  const fileSet = new Set(files);
  const candidates = findBarrelCandidates(files);
  let best = [];

  for (const barrelPath of candidates.slice(0, 12)) {
    try {
      const stat = fs.statSync(path.join(repoDir, barrelPath));
      if (stat.size > 300_000) continue;
      const content = fs.readFileSync(path.join(repoDir, barrelPath), "utf8");
      const barrelDir = barrelPath.split("/").slice(0, -1).join("/");
      const result = parseComponentExports(content, barrelDir, fileSet, repoDir, 1);
      if (result.length > best.length) best = result;
    } catch { /* skip */ }
  }

  return best.sort((a, b) => a.name.localeCompare(b.name));
}

/* ---- Directory-scan fallback ---- */

function collectFromDirectories(files) {
  const cands = files.filter(
    (f) =>
      SOURCE_EXT.test(f) &&
      !/\.(stories?|test|spec)\./.test(f) &&
      !/(^|\/)(__tests__|__mocks__|__testfixtures__|__fixtures__|e2e|examples?|transforms?)(\/|$)/i.test(f) &&
      !/(^|\/)\.storybook/i.test(f) &&
      !UTILITY_DIRS.test(f)
  );
  const groups = new Map();
  for (const f of cands) {
    const { key, name } = compRoot(f);
    if (!groups.has(key)) groups.set(key, { name, files: [] });
    groups.get(key).files.push(f);
  }
  return [...groups.values()]
    .filter((g) => !(TOP_LEVEL_BASENAMES.has(g.name.toLowerCase()) && g.files.length === 1))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function collectComponents(files, repoDir) {
  // Priority 1: barrel / entry-point based inventory (most accurate)
  if (repoDir) {
    const barrelResult = collectFromBarrel(files, repoDir);
    if (barrelResult.length >= 3) return barrelResult;
  }
  // Priority 2: directory scanning (fallback for repos without clear barrel)
  return collectFromDirectories(files);
}

function compRoot(relPath) {
  const parts = relPath.split("/");
  const file = parts[parts.length - 1];
  const base = baseName(file);
  const dirs = parts.slice(0, -1);
  if (dirs.length > 0 && !CONTAINER_DIRS.has(dirs[dirs.length - 1])) {
    return { key: dirs.join("/"), name: dirs[dirs.length - 1] };
  }
  return { key: "file:" + base, name: base };
}

function isTokenFile(f) {
  if (!(CSS_EXT.test(f) || /\.(json|ts|js)$/.test(f))) return false;
  if (f.includes("stories") || f.includes("node_modules")) return false;
  return /(variables|tokens|design-tokens|theme|tailwind|primitives|semantic|foundation)/i.test(f);
}

function collectStories(files) {
  return cap(
    files.filter((f) => /\.stories?\.(tsx?|jsx?|mdx)$/i.test(f)).sort((a, b) => a.localeCompare(b)),
    14
  );
}

function collectScripts(files) {
  const inScriptsDir = files.filter((f) => /(^|\/)(scripts|tools|automation|bin|tasks|generators)\//.test(f));
  const rootScripts = files.filter((f) => /\.(mjs|cjs)$/.test(f) && !f.includes("/"));
  const buildTools = files.filter((f) =>
    /(^|\/)(vite|rollup|webpack|tsup|gulp|esbuild|nx|turbo)[^/]*\.(config\.)?[jt]s$/.test(f)
  );
  const unique = new Map();
  for (const f of [...inScriptsDir, ...rootScripts, ...buildTools]) unique.set(f, f);
  return [...unique.values()].sort((a, b) => a.localeCompare(b)).slice(0, 8);
}

function isConfigFile(f) {
  const base = path.basename(f);
  if (/^agenta?\.md$/i.test(base) || /^claude\.md$/i.test(base)) return true;
  if (/(^|\/)package\.json$/.test(f)) return true;
  return /(^|\/)(tsconfig|jsconfig|astro|next|nuxt|tailwind|postcss|prettier|eslint)[^/]*\.json$/.test(f);
}

function collectDocs(files) {
  const md = files.filter((f) => /\.(md|mdx)$/.test(f) && !/\.claude\//.test(f));
  const docs = md.filter((f) => /(^|\/)docs?\//.test(f) || /^(readme|discovery)\.md$/i.test(path.basename(f)));
  const extra = md.filter((f) => !docs.includes(f) && !/(^|\/)docs?\//.test(f) && !/^(readme|discovery)\.md$/i.test(path.basename(f)));
  return cap([...docs, ...extra], 6);
}

function collectSkills(files) {
  return files.filter((f) => /\.claude\/skills\/[^/]+\/SKILL\.md$/.test(f)).sort();
}

/* ---------------- node builders ---------------- */

function assignIds(raw) {
  const taken = new Set();
  return raw.map((n) => {
    let id = slug(n.title) || "node";
    let k = 2;
    while (taken.has(id)) id = `${slug(n.title)}-${k++}`;
    taken.add(id);
    return { ...n, id };
  });
}

function skillNode(file) {
  const dir = path.posix.dirname(file).split("/");
  const name = dir[dir.length - 1];
  return {
    layer: "rules",
    title: name,
    sub: ".claude/skills",
    tag: "skill",
    files: [file],
    what: "Skill de Claude con un workflow documentado para automatizar una parte del sistema.",
    what_en: "Claude skill with a documented workflow to automate part of the system.",
    does: "Impone pasos y reglas reproducibles que cualquier agente puede seguir paso a paso.",
    does_en: "Enforces reproducible steps and rules any agent can follow step by step.",
  };
}

function ruleNode(matchingFiles) {
  const titles = matchingFiles.map(f => baseName(f).toUpperCase()).join(" & ");
  return {
    layer: "rules",
    title: titles,
    sub: "rules · source of truth",
    tag: "rule",
    files: matchingFiles,
    what: "Documento de instrucciones del proyecto que fusiona flujos de trabajo, fuentes de verdad y reglas globales.",
    what_en: "Project instruction document merging workflows, sources of truth and global rules.",
    does: "Es la lectura obligatoria para agentes: orquesta cómo se construye y mantiene el sistema.",
    does_en: "It is the mandatory reading for agents: it orchestrates how the system is built and maintained.",
  };
}

function docNode(file) {
  return {
    layer: "rules",
    title: baseName(file),
    sub: dirName(file),
    tag: "doc",
    files: [file],
    what: "Documentación del sistema que explica decisiones de diseño o arquitectura.",
    what_en: "System documentation explaining design or architecture decisions.",
    does: "Guía cómo aplicar o mantener el sistema de manera coherente.",
    does_en: "Guides how to apply or maintain the system coherently.",
  };
}

function tokenNode(file) {
  return {
    layer: "tokens",
    title: baseName(file),
    sub: dirName(file),
    tag: "token",
    files: [file],
    what: "Tokens del sistema con los valores de color, tipografía y spacing.",
    what_en: "System tokens with color, typography and spacing values.",
    does: "Define los valores que consumen los componentes: es el contrato de diseño.",
    does_en: "Defines the values consumed by components: it is the design contract.",
  };
}

function iconNode(file) {
  return {
    layer: "icons",
    title: baseName(file),
    sub: dirName(file),
    tag: "icon",
    files: [file],
    what: "Activo o componente de icono vectorial del sistema de diseño.",
    what_en: "Vector icon asset or component of the design system.",
    does: "Proporciona simbología y recursos visuales separados de los componentes de UI.",
    does_en: "Provides symbols and visual assets separated from UI components.",
  };
}

function describeComponent(name) {
  const key = name.toLowerCase();
  const descriptions = [
    [/chat|conversation|messagebox/, ["Panel donde la persona puede escribir preguntas y recibir respuestas sobre el producto.", "Mantiene la conversación visible y organiza cada mensaje en el orden en que se envía.", "Panel where a person can ask questions and receive answers about the product.", "Keeps the conversation visible and organizes messages in the order they are sent."]],
    [/guide|tour|onboarding/, ["Guía que acompaña a la persona mientras descubre el proyecto.", "Divide la explicación en pasos pequeños y ofrece ayuda cuando hace falta.", "Guide accompanying a person while they discover the project.", "Breaks the explanation into small steps and offers help when needed."]],
    [/repo.*tree|file.*tree|explorer/, ["Explorador que muestra las carpetas y archivos del repositorio.", "Permite abrir la estructura y elegir qué parte del código se quiere consultar.", "Explorer showing the repository's folders and files.", "Lets a person open the structure and choose which part of the code to inspect."]],
    [/edge|connector|connection|link/, ["Línea del diagrama que une dos partes relacionadas del proyecto.", "Hace visible qué elemento depende de otro o intercambia información con él.", "Diagram line joining two related parts of the project.", "Shows which element depends on another or exchanges information with it."]],
    [/^(?!.*lane).*(chip|node|item)/, ["Elemento compacto que representa una parte concreta del repositorio dentro del mapa.", "Resume su nombre y tipo para poder reconocerlo y seleccionarlo rápidamente.", "Compact element representing one specific repository part in the map.", "Summarizes its name and type so it can be recognized and selected quickly."]],
    [/lane|section|group/, ["Zona del mapa que reúne elementos que cumplen una función parecida.", "Separa visualmente las distintas áreas para que el diagrama sea más fácil de leer.", "Map area grouping elements with a similar purpose.", "Visually separates different areas so the diagram is easier to read."]],
    [/app|root|shell/, ["Contenedor principal que reúne las partes de la aplicación.", "Coordina qué pantalla se muestra y mantiene conectado el conjunto del producto.", "Main container bringing the application's parts together.", "Coordinates which screen is shown and keeps the product connected as a whole."]],
    [/search|finder|command/, ["Campo que permite escribir una consulta para encontrar o filtrar contenido.", "Recoge lo que busca la persona y muestra solo los resultados relacionados.", "Field for entering a query to find or filter content.", "Takes what the person is looking for and shows only related results."]],
    [/button|action|cta/, ["Control que una persona pulsa para iniciar una acción concreta.", "Convierte una decisión, como guardar o continuar, en una orden para la aplicación.", "Control a person presses to start a specific action.", "Turns a decision, such as save or continue, into an instruction for the application."]],
    [/card|tile/, ["Bloque visual que reúne la información principal de un elemento.", "Permite revisar y comparar contenido sin abrir una pantalla nueva.", "Visual block grouping the main information about an item.", "Lets people scan and compare content without opening a new screen."]],
    [/modal|dialog|drawer/, ["Panel temporal que aparece sobre la pantalla actual para centrar la atención.", "Permite confirmar, editar o consultar algo sin abandonar la tarea en curso.", "Temporary panel shown over the current screen to focus attention.", "Lets a person confirm, edit, or inspect something without leaving the current task."]],
    [/input|field|textarea/, ["Zona donde una persona puede escribir o modificar un dato.", "Recoge información para que la aplicación pueda guardarla o utilizarla.", "Area where a person can enter or change a value.", "Collects information so the application can save or use it."]],
    [/form/, ["Conjunto ordenado de campos para introducir información.", "Guía a la persona hasta completar y enviar todos los datos necesarios.", "Organized set of fields for entering information.", "Guides a person through completing and submitting the required data."]],
    [/nav|menu|sidebar|breadcrumb/, ["Elemento que muestra las rutas disponibles dentro del producto.", "Ayuda a moverse entre pantallas y a saber en qué parte se encuentra la persona.", "Element showing the routes available within the product.", "Helps people move between screens and understand where they are."]],
    [/table|grid|list/, ["Vista que organiza varios elementos para poder revisarlos en conjunto.", "Facilita comparar, ordenar y encontrar información dentro de una colección.", "View organizing multiple items so they can be reviewed together.", "Makes it easier to compare, sort, and find information in a collection."]],
    [/avatar|profile|user/, ["Representación visual de una persona o cuenta.", "Ayuda a reconocer rápidamente quién participa o a quién pertenece una acción.", "Visual representation of a person or account.", "Helps quickly identify who is involved or owns an action."]],
    [/badge|tag|status|pill/, ["Etiqueta breve que destaca una categoría o estado.", "Permite entender una situación de un vistazo sin leer una explicación larga.", "Short label highlighting a category or status.", "Communicates a situation at a glance without a long explanation."]],
    [/select|dropdown|combobox/, ["Control que presenta varias opciones y permite elegir una.", "Evita errores al limitar la elección a valores que la aplicación conoce.", "Control presenting several options and allowing one to be chosen.", "Prevents errors by limiting choices to values the application recognizes."]],
    [/tabs?/, ["Control que divide contenido relacionado en varias secciones.", "Permite cambiar de sección sin salir de la pantalla actual.", "Control dividing related content into several sections.", "Lets people switch sections without leaving the current screen."]],
    [/tooltip|popover/, ["Ayuda breve que aparece cerca de un elemento cuando se necesita contexto.", "Aclara la función de un control sin ocupar espacio permanente en la pantalla.", "Short help shown near an element when context is needed.", "Clarifies a control without taking permanent screen space."]],
    [/toast|alert|notice|message/, ["Mensaje que informa de un resultado, aviso o problema.", "Confirma lo ocurrido y explica si la persona debe hacer algo después.", "Message reporting a result, warning, or problem.", "Confirms what happened and explains whether the person needs to act next."]],
  ];
  const match = descriptions.find(([pattern]) => pattern.test(key));
  if (match) {
    const [, [what, does, whatEn, doesEn]] = match;
    return { what, does, what_en: whatEn, does_en: doesEn };
  }
  return {
    what: `${name} es una pieza de interfaz dedicada a una función concreta dentro del producto.`,
    what_en: `${name} is an interface piece dedicated to one specific function in the product.`,
    does: `Reúne el comportamiento de ${name} en un único lugar para usarlo de forma consistente.`,
    does_en: `Keeps ${name}'s behavior in one place so it can be used consistently.`,
  };
}

function componentNode(c) {
  const description = describeComponent(c.name);
  return {
    layer: "components",
    title: c.name,
    sub: dirName(c.files[0]),
    tag: "component",
    files: c.files,
    ...description,
  };
}

function storyNode(file, components) {
  const base = baseName(file).replace(/\.(stories?|story)$/i, "");
  const owner = components.find((c) => c.name === base);
  return {
    layer: "stories",
    title: owner ? `${base} · stories` : base,
    sub: dirName(file),
    tag: "story",
    files: [file],
    what: `Stories de Storybook para el componente ${base}.`,
    what_en: `Storybook stories for the ${base} component.`,
    does: "Muestran variantes y props visibles: definen el contrato que se replica en la UI.",
    does_en: "Show visible variants and props: they define the contract replicated in the UI.",
  };
}

function scriptNode(file) {
  return {
    layer: "scripts",
    title: baseName(file),
    sub: dirName(file),
    tag: "tool",
    files: [file],
    what: "Script de automatización o configuración de build.",
    what_en: "Automation or build configuration script.",
    does: "Automatiza tareas de generación, sync o verificación del sistema.",
    does_en: "Automates generation, sync or verification tasks for the system.",
  };
}

function configNode(file) {
  return {
    layer: "config",
    title: baseName(file),
    sub: dirName(file),
    tag: "config",
    files: [file],
    what: "Archivo de configuración que define el contrato del paquete.",
    what_en: "Configuration file defining the package contract.",
    does: "Declara dependencias, scripts y ajustes del proyecto.",
    does_en: "Declares dependencies, scripts and project settings.",
  };
}

/* ---------------- edges ---------------- */

function buildEdges(nodes, fileToNode, fileSet, repoDir) {
  const seen = new Set();
  const out = [];
  for (const n of nodes) {
    const targets = scanImports(n.files, fileSet, repoDir);
    for (const targetFile of targets) {
      const tgt = fileToNode.get(targetFile);
      if (!tgt || tgt === n) continue;
      const key = `${n.id}|${tgt.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const verb = verbFor(n, tgt);
      out.push({
        id: `e${out.length + 1}`,
        source: n.id,
        target: tgt.id,
        verb,
        color: VERB_COLORS[verb] || "#a78bfa",
      });
      if (out.length >= 40) break;
    }
  }
  return out;
}

function scanImports(files, fileSet, repoDir) {
  const out = new Set();
  const READABLE = /\.(tsx?|jsx?|mjs|js|vue|svelte|css|scss|sass)$/;
  for (const f of files) {
    if (!READABLE.test(f)) continue;
    let content;
    try {
      const full = path.join(repoDir, f);
      const stat = fs.statSync(full);
      if (stat.size > 524288) continue;
      content = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const re = /(?:import\s+(?:[^'"]*?\s+from\s+)?|require\(\s*)['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(content))) {
      const resolved = resolveImport(f, m[1], fileSet);
      if (resolved) out.add(resolved);
    }
  }
  return out;
}

function resolveImport(fromFile, spec, fileSet) {
  if (!spec.startsWith(".")) return null;
  const dir = path.posix.dirname(fromFile);
  const base = path.posix.normalize(path.posix.join(dir, spec));
  const EXTS = ["", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".vue", ".svelte", ".css", ".scss", ".sass", ".json"];
  for (const ext of EXTS) {
    if (fileSet.has(base + ext)) return base + ext;
  }
  const INDEX = ["index.tsx", "index.ts", "index.jsx", "index.js", "index.mjs", "index.vue"];
  for (const ix of INDEX) {
    if (fileSet.has(path.posix.join(base, ix))) return path.posix.join(base, ix);
  }
  return null;
}

function verbFor(src, tgt) {
  if (src.layer === "stories" && tgt.layer === "components") return "defines";
  if (tgt.layer === "tokens") return "uses";
  if (src.layer === "components" && tgt.layer === "components") return "imports";
  if (src.layer === "scripts") return "reads";
  if (src.layer === "rules") return "orchestrates";
  return "imports";
}
