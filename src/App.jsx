import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition } from "react";
import { Background, Controls, MarkerType, ReactFlow } from "@xyflow/react";
import { doesFor, subFor, whatFor } from "./map-data.js";
import { buildLayout } from "./layout.js";
import ChipNode from "./ChipNode.jsx";
import LaneNode from "./LaneNode.jsx";
import LabeledEdge from "./LabeledEdge.jsx";
import RepoTree from "./RepoTree.jsx";
import ProjectGuide from "./ProjectGuide.jsx";
import { getFileExplanation, getFolderExplanation } from "./file-descriptions.js";

const nodeTypes = { chip: ChipNode, lane: LaneNode };
const edgeTypes = { labeled: LabeledEdge };

const WORLD_LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "af", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦" },
  { code: "sq", name: "Albanian", native: "Shqip", flag: "🇦🇱" },
  { code: "am", name: "Amharic", native: "አማርኛ", flag: "🇪🇹" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycan", flag: "🇦🇿" },
  { code: "eu", name: "Basque", native: "Euskara", flag: "🏴" },
  { code: "be", name: "Belarusian", native: "Беларуская", flag: "🇧🇾" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "bs", name: "Bosnian", native: "Bosanski", flag: "🇧🇦" },
  { code: "bg", name: "Bulgarian", native: "Български", flag: "🇧🇬" },
  { code: "ca", name: "Catalan", native: "Català", flag: "🏴" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "hr", name: "Croatian", native: "Hrvatski", flag: "🇭🇷" },
  { code: "cs", name: "Czech", native: "Čeština", flag: "🇨🇿" },
  { code: "da", name: "Danish", native: "Dansk", flag: "🇩🇰" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "et", name: "Estonian", native: "Eesti", flag: "🇪🇪" },
  { code: "fi", name: "Finnish", native: "Suomi", flag: "🇫🇮" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "gl", name: "Galician", native: "Galego", flag: "🏴" },
  { code: "ka", name: "Georgian", native: "ქართული", flag: "🇬🇪" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "el", name: "Greek", native: "Ελληνικά", flag: "🇬🇷" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "he", name: "Hebrew", native: "עברית", flag: "🇮🇱" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "hu", name: "Hungarian", native: "Magyar", flag: "🇭🇺" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ga", name: "Irish", native: "Gaeilge", flag: "🇮🇪" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "kk", name: "Kazakh", native: "Қазақша", flag: "🇰🇿" },
  { code: "km", name: "Khmer", native: "ភាសាខ្មែរ", flag: "🇰🇭" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "lv", name: "Latvian", native: "Latviešu", flag: "🇱🇻" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių", flag: "🇱🇹" },
  { code: "mk", name: "Macedonian", native: "Македонски", flag: "🇲🇰" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "mn", name: "Mongolian", native: "Монгол", flag: "🇲🇳" },
  { code: "ne", name: "Nepali", native: "नेपाली", flag: "🇳🇵" },
  { code: "nb", name: "Norwegian", native: "Norsk", flag: "🇳🇴" },
  { code: "fa", name: "Persian", native: "فارسی", flag: "🇮🇷" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ro", name: "Romanian", native: "Română", flag: "🇷🇴" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "sr", name: "Serbian", native: "Српски", flag: "🇷🇸" },
  { code: "si", name: "Sinhala", native: "සිංහල", flag: "🇱🇰" },
  { code: "sk", name: "Slovak", native: "Slovenčina", flag: "🇸🇰" },
  { code: "sl", name: "Slovenian", native: "Slovenščina", flag: "🇸🇮" },
  { code: "so", name: "Somali", native: "Soomaali", flag: "🇸🇴" },
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪" },
  { code: "sv", name: "Swedish", native: "Svenska", flag: "🇸🇪" },
  { code: "tl", name: "Tagalog", native: "Tagalog", flag: "🇵🇭" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "th", name: "Thai", native: "ภาษาไทย", flag: "🇹🇭" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "uk", name: "Ukrainian", native: "Українська", flag: "🇺🇦" },
  { code: "ur", name: "Urdu", native: "اردو", flag: "🇵🇰" },
  { code: "uz", name: "Uzbek", native: "O'zbek", flag: "🇺🇿" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "cy", name: "Welsh", native: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { code: "zu", name: "Zulu", native: "IsiZulu", flag: "🇿🇦" },
];

const DEFAULT_SAVED_REPOS = [
  { name: "Marta Conde (CMD Formación)", url: "https://github.com/MartaCondeDesign/CMD-Formacion.git", requiresToken: true },
  { name: "Marta Conde (Code Repo)", url: "https://github.com/MartaCondeDesign/Code-Repo.git", requiresToken: false }
];

const requiresToken = (url = "") => {
  const norm = url.toLowerCase();
  return norm.includes("cmd-formacion") || norm.includes("cmd_formacion") || norm.includes("private");
};

const DESIGN_REPOS = [
  { name: "Shadcn (ui)", url: "https://github.com/shadcn-ui/ui" },
  { name: "MUI (Material UI)", url: "https://github.com/mui/material-ui" },
  { name: "Radix (Primitives)", url: "https://github.com/radix-ui/primitives" },
  { name: "Chakra (Chakra UI)", url: "https://github.com/chakra-ui/chakra-ui" },
  { name: "Facebook (Astryx)", url: "https://github.com/facebook/astryx" },
  { name: "Alibaba (Ant Design)", url: "https://github.com/ant-design/ant-design" },
  { name: "IBM (Carbon)", url: "https://github.com/carbon-design-system/carbon" },
  { name: "Microsoft (Fluent UI)", url: "https://github.com/microsoft/fluentui" },
  { name: "Palantir (Blueprint)", url: "https://github.com/palantir/blueprint" },
  { name: "Segment (Evergreen)", url: "https://github.com/segmentio/evergreen" },
  { name: "Semantic Org (Semantic UI)", url: "https://github.com/Semantic-Org/Semantic-UI" },
  { name: "GitHub (Primer)", url: "https://github.com/primer/react" },
  { name: "JetBrains (Ring UI)", url: "https://github.com/JetBrains/ring-ui" },
  { name: "Uber (Base Web)", url: "https://github.com/uber/baseweb" },
  { name: "HPE (Grommet)", url: "https://github.com/grommet/grommet" },
  { name: "Elastic (EUI)", url: "https://github.com/elastic/eui" },
  { name: "Adobe (Spectrum)", url: "https://github.com/adobe/spectrum-web-components" },
  { name: "ING (Lion)", url: "https://github.com/ing-bank/lion" },
  { name: "Microsoft (FAST)", url: "https://github.com/microsoft/fast" },
  { name: "Twilio (Paste)", url: "https://github.com/twilio-labs/paste" },
  { name: "Kiwi.com (Orbit)", url: "https://github.com/kiwicom/orbit" },
  { name: "Pinterest (Gestalt)", url: "https://github.com/pinterest/gestalt" },
  { name: "Shopify (Polaris)", url: "https://github.com/Shopify/polaris" },
  { name: "Zendesk (Garden)", url: "https://github.com/zendeskgarden/react-components" },
  { name: "Workday (Canvas)", url: "https://github.com/Workday/canvas-kit" },
];

const DEFAULT_FILES = [
  ".github/workflows/ci.yml", "docs/architecture.md", "public/logo.svg", "src/api/products.js",
  "src/components/Button.jsx", "src/components/ProductCard.jsx", "src/components/SearchBar.jsx",
  "src/pages/Home.jsx", "src/styles/tokens.css", "src/App.jsx", "src/main.jsx", "package.json", "vite.config.js",
];

const DEFAULT_LAYERS = [
  { id: "docs", label: "Docs & workflow", sub: "Reglas, documentación y automatización", sub_en: "Rules, documentation, and automation", color: "#a78bfa" },
  { id: "foundation", label: "Foundations", sub: "Tokens y configuración compartida", sub_en: "Shared tokens and configuration", color: "#fbbf24" },
  { id: "ui", label: "UI components", sub: "Piezas reutilizables de la interfaz", sub_en: "Reusable interface building blocks", color: "#34d399" },
  { id: "app", label: "Application", sub: "Pantallas, datos y punto de entrada", sub_en: "Screens, data, and entry point", color: "#38bdf8" },
];

const DEFAULT_NODES = [
  { id: "architecture", layer: "docs", title: "architecture.md", sub: "docs · system overview", tag: "doc", files: ["docs/architecture.md"], what: "Documento que resume las partes del proyecto y cómo se relacionan.", what_en: "Document summarizing the project parts and how they relate.", does: "Ayuda a una persona nueva a entender la arquitectura antes de editar código.", does_en: "Helps a newcomer understand the architecture before editing code." },
  { id: "ci", layer: "docs", title: "CI workflow", sub: ".github/workflows", tag: "workflow", files: [".github/workflows/ci.yml"], what: "Automatización que comprueba cada cambio enviado al repositorio.", what_en: "Automation that checks every change pushed to the repository.", does: "Instala dependencias, ejecuta pruebas y genera la aplicación.", does_en: "Installs dependencies, runs tests, and builds the application." },
  { id: "tokens", layer: "foundation", title: "tokens.css", sub: "color · type · spacing", tag: "tokens", files: ["src/styles/tokens.css"], what: "Variables visuales compartidas por toda la interfaz.", what_en: "Visual variables shared across the interface.", does: "Mantiene colores, tipografía y espaciado consistentes.", does_en: "Keeps colors, typography, and spacing consistent." },
  { id: "package", layer: "foundation", title: "package.json", sub: "dependencies · scripts", tag: "config", files: ["package.json"], what: "Contrato técnico del proyecto con sus dependencias y comandos.", what_en: "The project's technical contract with dependencies and commands.", does: "Permite instalar, ejecutar y compilar la aplicación.", does_en: "Enables installing, running, and building the application." },
  { id: "button", layer: "ui", title: "Button", sub: "src/components", tag: "component", files: ["src/components/Button.jsx"], what: "Botón reutilizable con variantes primaria y secundaria.", what_en: "Reusable button with primary and secondary variants.", does: "Unifica las acciones principales de la interfaz.", does_en: "Standardizes primary actions throughout the interface." },
  { id: "search", layer: "ui", title: "SearchBar", sub: "src/components", tag: "component", files: ["src/components/SearchBar.jsx"], what: "Campo de búsqueda controlado para filtrar productos.", what_en: "Controlled search field for filtering products.", does: "Comunica cada consulta a la pantalla que presenta el catálogo.", does_en: "Sends each query to the screen displaying the catalog." },
  { id: "card", layer: "ui", title: "ProductCard", sub: "src/components", tag: "component", files: ["src/components/ProductCard.jsx"], what: "Tarjeta que presenta un producto, su precio y una acción.", what_en: "Card presenting a product, its price, and an action.", does: "Convierte los datos del catálogo en una pieza visual reutilizable.", does_en: "Turns catalog data into a reusable visual piece." },
  { id: "api", layer: "app", title: "products API", sub: "src/api", tag: "data", files: ["src/api/products.js"], what: "Módulo que obtiene los productos para la aplicación.", what_en: "Module fetching products for the application.", does: "Aísla el acceso a datos del resto de la interfaz.", does_en: "Isolates data access from the rest of the interface." },
  { id: "home", layer: "app", title: "Home", sub: "src/pages", tag: "page", files: ["src/pages/Home.jsx"], what: "Pantalla principal del catálogo de ejemplo.", what_en: "Main screen of the sample catalog.", does: "Combina búsqueda, datos y tarjetas de producto.", does_en: "Combines search, data, and product cards." },
  { id: "app", layer: "app", title: "App", sub: "src/App.jsx", tag: "entry", files: ["src/App.jsx", "src/main.jsx"], what: "Raíz de la aplicación y punto de montaje en el navegador.", what_en: "Application root and browser mounting point.", does: "Inicia la interfaz y presenta la pantalla principal.", does_en: "Starts the interface and renders the main screen." },
];

const DEFAULT_EDGES = [
  { id: "e1", source: "tokens", target: "button", verb: "styles", color: "#fbbf24" },
  { id: "e2", source: "tokens", target: "card", verb: "styles", color: "#fbbf24" },
  { id: "e3", source: "search", target: "home", verb: "used by", color: "#34d399" },
  { id: "e4", source: "card", target: "home", verb: "used by", color: "#34d399" },
  { id: "e5", source: "api", target: "home", verb: "feeds", color: "#38bdf8" },
  { id: "e6", source: "home", target: "app", verb: "renders", color: "#a78bfa" },
  { id: "e7", source: "package", target: "app", verb: "builds", color: "#fb7185" },
];

const DEFAULT_CONTENTS = {
  "src/components/Button.jsx": `export function Button({ children, variant = "primary", onClick }) {\n  return (\n    <button className={\`button button--\${variant}\`} onClick={onClick}>\n      {children}\n    </button>\n  );\n}\n`,
  "src/components/ProductCard.jsx": `import { Button } from "./Button.jsx";\n\nexport function ProductCard({ product }) {\n  return (\n    <article className="product-card">\n      <img src={product.image} alt="" />\n      <h2>{product.name}</h2>\n      <p>{product.price}</p>\n      <Button>Add to cart</Button>\n    </article>\n  );\n}\n`,
  "src/components/SearchBar.jsx": `export function SearchBar({ value, onChange }) {\n  return <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search products" />;\n}\n`,
  "src/pages/Home.jsx": `import { SearchBar } from "../components/SearchBar.jsx";\nimport { ProductCard } from "../components/ProductCard.jsx";\n\nexport function Home({ products }) {\n  return <main>{products.map((product) => <ProductCard key={product.id} product={product} />)}</main>;\n}\n`,
  "src/styles/tokens.css": `:root {\n  --color-brand: #2563eb;\n  --color-surface: #ffffff;\n  --space-md: 16px;\n  --radius-md: 8px;\n}\n`,
  "src/App.jsx": `import { Home } from "./pages/Home.jsx";\n\nexport default function App() {\n  return <Home products={[]} />;\n}\n`,
  "src/main.jsx": `import { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\n\ncreateRoot(document.getElementById("root")).render(<App />);\n`,
  "src/api/products.js": `export async function getProducts() {\n  const response = await fetch("/api/products");\n  return response.json();\n}\n`,
  "package.json": `{"name":"cmdbase","private":true,"scripts":{"dev":"vite","build":"vite build"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"vite":"^6.0.0"}}`,
  "docs/architecture.md": `# Atlas Shop\n\nA small example storefront organized into foundations, reusable UI, data access, and pages.\n`,
  ".github/workflows/ci.yml": `name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm run build\n`,
};

const DEFAULT_MAP = {
  repoName: "cmdbase",
  repoUrl: null,
  files: DEFAULT_FILES,
  fileContents: DEFAULT_CONTENTS,
  layers: DEFAULT_LAYERS,
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  verbDefs: {
    es: { styles: "Aplica los tokens visuales.", "used by": "La pantalla utiliza este componente.", feeds: "Proporciona datos a la pantalla.", renders: "Renderiza la vista principal.", builds: "Define cómo se compila la aplicación." },
    en: { styles: "Applies visual tokens.", "used by": "The screen uses this component.", feeds: "Provides data to the screen.", renders: "Renders the main view.", builds: "Defines how the application is built." },
  },
};

const STRINGS = {
  es: {
    title: "Code Repo",
    sub: "Tu repositorio de código explicado en lenguaje de diseño",
    repoPlaceholder: "https://github.com/usuario/repo (o git@github.com:...)",
    repoButton: "Mapear repositorio",
    repoAnalyzing: "Leyendo la estructura y creando el mapa,",
    repoAnalyzingSub: "dame unos segundos…",
    resetTip: "Limpiar y volver a cmdbase",
    treeEmpty: "Introduce un repositorio de GitHub para explorar su árbol completo.",
    map: "MAPA VISUAL",
    what: "QUÉ ES",
    does: "PARA QUÉ SIRVE",
    guide: "Guide",
  },
  en: {
    title: "Code Repo",
    sub: "Your code repo explained in design language",
    repoPlaceholder: "https://github.com/user/repo (or git@github.com:...)",
    repoButton: "Map repository",
    repoAnalyzing: "Reading the structure and building the map,",
    repoAnalyzingSub: "give me a few seconds…",
    resetTip: "Clear and return to cmdbase",
    treeEmpty: "Enter a GitHub repository to explore its complete tree.",
    map: "VISUAL MAP",
    what: "WHAT IT IS",
    does: "WHAT IT DOES",
    guide: "Guide",
  },
};

const WIZARD_STEPS = {
  es: [
    {
      icon: "🗺️",
      title: "Tu código, explicado para diseñadores",
      body: "Code Repo convierte cualquier repositorio de GitHub en un mapa visual. Verás cómo se organizan los archivos, qué hace cada parte y cómo se relacionan entre sí — sin necesidad de leer código.",
      target: null,
    },
    {
      icon: "🔗",
      title: "Obtén la URL del repositorio",
      body: "Ve al repositorio en GitHub y pulsa el botón verde Code. Aparecerá un desplegable: copia la URL de la pestaña HTTPS.",
      target: ".repo-input-wrap",
      github: true,
      hint: "También puedes elegir directamente uno de los sistemas de diseño desde el desplegable junto al campo.",
    },
    {
      icon: "⚡",
      title: "Pégala y pulsa Mapear repositorio",
      body: "Pega la URL en el campo y pulsa este botón. En unos segundos verás el mapa completo del repositorio.",
      target: ".repo-row .repo-btn:not(.guide-button)",
    },
    {
      icon: "👆",
      title: "Haz clic en cualquier pieza del mapa",
      body: "Cada rectángulo es una parte del proyecto. Al hacer clic, el panel de la derecha te explica qué es y para qué sirve — en lenguaje de diseño.",
      target: ".graph",
      side: "left",
    },
    {
      icon: "🌳",
      title: "El árbol de archivos",
      body: "A la izquierda tienes todos los archivos del repositorio organizados en carpetas. Haz clic en cualquier archivo o carpeta para ver qué hace y resaltarlo en el mapa.",
      target: ".repo-tree",
      side: "right",
    },
    {
      icon: "📖",
      title: "La guía del proyecto",
      body: "El botón flotante de la esquina inferior derecha abre la guía: un resumen completo del proyecto con qué es, cómo está organizado y qué hace cada parte — todo en lenguaje de diseño.",
      target: ".guide-fab",
    },
    {
      icon: "⭐",
      title: "Guarda tus repositorios favoritos",
      body: "Haz clic en la flecha junto al campo de URL para desplegar el listado de repositorios. Pasa el cursor sobre cualquiera y pulsa la estrella ☆ para guardarlo — aparecerá en la sección Guardados.",
      target: ".repo-menu-toggle",
    },
    {
      icon: "🧩",
      title: "Explora los componentes desde la guía",
      body: "Dentro de la guía, las cards de métricas (Componentes, Patrones, Tokens…) resaltan esos elementos en el mapa y el árbol de archivos al hacer clic sobre ellas.",
      target: ".design-metrics",
      openGuide: true,
    },
  ],
  en: [
    {
      icon: "🗺️",
      title: "Your code, explained for designers",
      body: "Code Repo turns any GitHub repository into a visual map. See how files are organized, what each part does, and how they relate — no code reading required.",
      target: null,
    },
    {
      icon: "🔗",
      title: "Get the repository URL",
      body: "Go to the repository on GitHub and click the green Code button. A dropdown appears — copy the URL from the HTTPS tab.",
      target: ".repo-input-wrap",
      github: true,
      hint: "You can also pick one of the well-known design systems directly from the dropdown next to the field.",
    },
    {
      icon: "⚡",
      title: "Paste it and click Map repository",
      body: "Paste the URL into the field and click this button. The full map will appear in a few seconds.",
      target: ".repo-row .repo-btn:not(.guide-button)",
    },
    {
      icon: "👆",
      title: "Click on any piece of the map",
      body: "Each rectangle represents a part of the project. Clicking one opens the right panel explaining what it is and what it does — in design language.",
      target: ".graph",
      side: "left",
    },
    {
      icon: "🌳",
      title: "The file tree",
      body: "On the left you have all the repository files organized in folders. Click any file or folder to see what it does and highlight it on the map.",
      target: ".repo-tree",
      side: "right",
    },
    {
      icon: "📖",
      title: "The project guide",
      body: "The floating button in the bottom-right corner opens the guide: a full summary of the project with what it is, how it's organised, and what each part does — all in design language.",
      target: ".guide-fab",
    },
    {
      icon: "⭐",
      title: "Save your favourite repositories",
      body: "Click the arrow next to the URL field to open the repository list. Hover over any repo and click the ☆ star to save it — it will appear in the Saved section every time you open the tool.",
      target: ".repo-menu-toggle",
    },
    {
      icon: "🧩",
      title: "Explore components from the guide",
      body: "Inside the guide, the metric cards (Components, Patterns, Tokens…) highlight those elements on the map and file tree when clicked.",
      target: ".design-metrics",
      openGuide: true,
    },
  ],
};

function styledEdge(edge, active, dimmed, labelOffsetY = -14, hideLabel = false) {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "labeled",
    data: { color: edge.color, verb: edge.verb, dimmed, labelOffsetY, hideLabel },
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: edge.color, width: 16, height: 16 },
    style: { stroke: edge.color, strokeWidth: active ? 2.8 : 1.5, opacity: dimmed ? 0.14 : 1 },
  };
}

function codeLanguage(filePath = "") {
  const extension = filePath.split(".").pop()?.toLowerCase();
  return ({
    js: "JavaScript", jsx: "React JSX", ts: "TypeScript", tsx: "React TSX", css: "CSS", scss: "SCSS",
    html: "HTML", json: "JSON", md: "Markdown", mdx: "MDX", yml: "YAML", yaml: "YAML", py: "Python",
    rb: "Ruby", go: "Go", rs: "Rust", java: "Java", sh: "Shell", mjs: "JavaScript", cjs: "JavaScript",
  })[extension] || "Text";
}

function alternateExplanation(item, lang, version = 1) {
  const type = item?.tag || item?.layer || "default";
  if (version === 2) {
    const purpose = doesFor(item, lang) || whatFor(item, lang);
    return lang === "es"
      ? `Paso a paso: primero aparece una necesidad relacionada con ${item.title}. Después, esta parte hace su trabajo. El resultado es sencillo: ${purpose}`
      : `Step by step: first there is a need related to ${item.title}. Then this part does its job. The result is simple: ${purpose}`;
  }
  if (version === 3) {
    const identity = whatFor(item, lang);
    return lang === "es"
      ? `La forma más corta de entenderlo: ${item.title} existe para resolver una tarea concreta. ${identity} Sin esta parte, esa tarea tendría que resolverse en otro lugar.`
      : `The shortest way to understand it: ${item.title} exists to solve one specific task. ${identity} Without this part, that task would need to be handled somewhere else.`;
  }
  if (type === "component") {
    const name = item.title;
    const key = name.toLowerCase();
    const variants = [
      [/chat|conversation|messagebox/, [`${name} es como una conversación de ayuda: mantiene juntas las preguntas y respuestas para poder seguir el hilo.`, `${name} is like a help conversation: it keeps questions and answers together so the thread is easy to follow.`]],
      [/guide|tour|onboarding/, [`${name} es como una persona que te acompaña durante una visita y te explica cada zona cuando llegas a ella.`, `${name} is like someone accompanying you on a tour and explaining each area as you reach it.`]],
      [/repo.*tree|file.*tree|explorer/, [`${name} es como el índice de un archivador: abre carpetas hasta llegar al documento que buscas.`, `${name} is like the index of a filing cabinet: open folders until you reach the document you need.`]],
      [/edge|connector|connection|link/, [`${name} es como una flecha dibujada entre dos notas: enseña de forma directa que están relacionadas.`, `${name} is like an arrow drawn between two notes: it directly shows that they are related.`]],
      [/^(?!.*lane).*(chip|node|item)/, [`${name} es como una etiqueta sobre un mapa: representa una parte concreta y permite abrir más información.`, `${name} is like a label on a map: it represents one specific part and opens more information.`]],
      [/lane|section|group/, [`${name} es como una estantería: mantiene juntas las piezas que pertenecen al mismo tipo.`, `${name} is like a shelf: it keeps pieces of the same type together.`]],
      [/app|root|shell/, [`${name} es como la estructura de una casa: sostiene y conecta las distintas habitaciones de la aplicación.`, `${name} is like the structure of a house: it supports and connects the application's different rooms.`]],
      [/search|finder|command/, [`${name} es como el buscador de una biblioteca: escribes una pista y te acerca a lo que necesitas.`, `${name} is like a library search desk: you enter a clue and it brings you closer to what you need.`]],
      [/button|action|cta/, [`${name} es como un interruptor: al pulsarlo le dices a la aplicación que haga algo concreto.`, `${name} is like a switch: pressing it tells the application to do one specific thing.`]],
      [/card|tile/, [`${name} es como una ficha de catálogo: coloca junta la información importante para revisarla rápidamente.`, `${name} is like a catalog card: it keeps the important information together for quick scanning.`]],
      [/modal|dialog|drawer/, [`${name} es como una pequeña ventana de conversación encima de la tarea que ya estabas haciendo.`, `${name} is like a small conversation window placed over the task you were already doing.`]],
      [/input|field|textarea/, [`${name} es como una casilla de un formulario en papel: ahí escribes un dato concreto.`, `${name} is like one box on a paper form: it is where you enter one specific value.`]],
      [/form/, [`${name} es como un cuestionario que reúne, paso a paso, toda la información necesaria.`, `${name} is like a questionnaire that gathers all the required information step by step.`]],
      [/nav|menu|sidebar|breadcrumb/, [`${name} es como un mapa del edificio: te enseña a dónde puedes ir y dónde estás.`, `${name} is like a building map: it shows where you can go and where you are.`]],
      [/table|grid|list/, [`${name} es como una hoja ordenada: coloca muchos elementos juntos para compararlos con facilidad.`, `${name} is like an organized sheet: it places many items together so they are easy to compare.`]],
      [/avatar|profile|user/, [`${name} funciona como una foto en una tarjeta de identificación: permite reconocer a una persona rápidamente.`, `${name} works like the photo on an ID card: it helps identify a person quickly.`]],
      [/badge|tag|status|pill/, [`${name} es como una pegatina pequeña: resume un estado o categoría con muy poco espacio.`, `${name} is like a small sticker: it summarizes a status or category in very little space.`]],
      [/select|dropdown|combobox/, [`${name} es como una lista de opciones preparada: solo tienes que abrirla y escoger una.`, `${name} is like a prepared list of choices: open it and pick one.`]],
      [/tabs?/, [`${name} se parece a las pestañas de una carpeta: cambia la sección visible sin cerrar lo demás.`, `${name} is like tabs in a folder: it changes the visible section without closing everything else.`]],
      [/tooltip|popover/, [`${name} es como una nota breve que aparece justo cuando necesitas una aclaración.`, `${name} is like a short note that appears exactly when you need clarification.`]],
      [/toast|alert|notice|message/, [`${name} es como un aviso rápido: confirma qué ha pasado y después desaparece o espera una acción.`, `${name} is like a quick notice: it confirms what happened and then disappears or waits for an action.`]],
    ];
    const match = variants.find(([pattern]) => pattern.test(key));
    if (match) return match[1][lang === "es" ? 0 : 1];
  }
  const es = {
    component: `${item.title} reúne una función visual concreta para poder usarla de la misma manera en todo el producto.`,
    page: `${item.title} es como una habitación: reúne varias piezas para que la persona pueda hacer una tarea completa.`,
    data: `${item.title} funciona como un mensajero: busca la información y se la entrega a la pantalla que la necesita.`,
    config: `${item.title} es como una lista de instrucciones: le dice al proyecto qué necesita y cómo debe arrancar.`,
    doc: `${item.title} es el manual del proyecto: explica las decisiones para que cualquier persona pueda orientarse.`,
    workflow: `${item.title} es como un robot de revisión: comprueba automáticamente que los cambios funcionen bien.`,
    tokens: `${item.title} es como una caja de colores y medidas compartida: ayuda a que toda la interfaz se vea igual.`,
    entry: `${item.title} es la puerta de entrada: desde aquí empieza a funcionar la aplicación.`,
    tool: `${item.title} ahorra trabajo manual: realiza una tarea repetitiva de forma automática.`,
    story: `${item.title} enseña ejemplos de cómo puede verse y comportarse una pieza de la interfaz.`,
    default: `${item?.title || "Esta parte"} es una pieza del proyecto. Trabaja junto a otras piezas para que la aplicación funcione.`,
  };
  const en = {
    component: `Think of ${item.title} as a LEGO piece: it is built once and can be used on several screens.`,
    page: `${item.title} is like a room: it brings several pieces together so a person can complete a task.`,
    data: `${item.title} works like a messenger: it fetches information and delivers it to the screen that needs it.`,
    config: `${item.title} is like an instruction list: it tells the project what it needs and how to start.`,
    doc: `${item.title} is the project manual: it explains decisions so anyone can find their way around.`,
    workflow: `${item.title} is like a review robot: it automatically checks that changes work correctly.`,
    tokens: `${item.title} is like a shared box of colors and measurements that keeps the interface consistent.`,
    entry: `${item.title} is the front door: this is where the application starts running.`,
    tool: `${item.title} saves manual work by completing a repetitive task automatically.`,
    story: `${item.title} shows examples of how an interface piece can look and behave.`,
    default: `${item?.title || "This part"} is one piece of the project. It works with other pieces to make the application run.`,
  };
  const messages = lang === "es" ? es : en;
  return messages[type] || messages.default;
}

function ExplanationActions({ lang, level, onAlternate, onReset }) {
  const exhausted = level >= 3;
  return (
    <div className="explanation-actions">
      <button className="rephrase-btn" onClick={onAlternate} disabled={exhausted}>{exhausted ? (lang === "es" ? "Se me han acabado las ideas" : "I have run out of ideas") : (lang === "es" ? "Explícamelo de otra manera" : "Explain it another way")}</button>
      {level > 0 && <button className="icon-btn has-tooltip" aria-label={lang === "es" ? "Volver a la explicación inicial" : "Return to the first explanation"} data-tooltip={lang === "es" ? "Volver a la explicación inicial" : "Return to the first explanation"} onClick={onReset}>↶</button>}
    </div>
  );
}

function FileVisualPreview({ path, content, lang }) {
  if (!path || !content || typeof content !== "string") return null;
  const ext = path.split(".").pop().toLowerCase();

  // Only render SVG preview if content contains valid SVG markup that can actually be displayed
  if (ext === "svg" && content.includes("<svg") && content.includes("</svg>")) {
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
    return (
      <div className="inspector-media-preview">
        <span className="media-preview-title">{lang === "es" ? "PREVISUALIZACIÓN VECTORIAL SVG" : "SVG VECTOR PREVIEW"}</span>
        <div className="media-preview-box svg-box">
          <img src={svgDataUrl} alt={path.split("/").pop()} style={{ maxWidth: "140px", maxHeight: "140px", objectFit: "contain", display: "block", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  // Do NOT render fake generic component mockups or dummy preview boxes
  return null;
}

export default function App() {
  const [docFullscreenOpen, setDocFullscreenOpen] = useState(false);
  const downloadSelectedFile = (filename, content) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "file.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const [map, setMap] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState(null);
  const [lang, setLang] = useState("es");
  const [selected, setSelected] = useState(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [selectedIsFolder, setSelectedIsFolder] = useState(false);
  const [relatedIds, setRelatedIds] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [repoMenuOpen, setRepoMenuOpen] = useState(false);
  const [gitToken, setGitToken] = useState(() => window.localStorage.getItem("git-token") || "");
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [modalToken, setModalToken] = useState("");
  const [saveToken, setSaveToken] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("recent-searches")) || [];
    } catch {
      return [];
    }
  });
  const [flow, setFlow] = useState(null);
  const [treeWidth, setTreeWidth] = useState(() => Number(window.localStorage.getItem("repo-tree-width")) || 360);
  const [resizingTree, setResizingTree] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(() => Number(window.localStorage.getItem("repo-inspector-width")) || 340);
  const [resizingInspector, setResizingInspector] = useState(false);
  const [explanationLevel, setExplanationLevel] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [readingMenuOpen, setReadingMenuOpen] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const [savedRepos, setSavedRepos] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("saved-repos")) || DEFAULT_SAVED_REPOS;
    } catch {
      return DEFAULT_SAVED_REPOS;
    }
  });

  useEffect(() => {
    window.localStorage.setItem("saved-repos", JSON.stringify(savedRepos));
  }, [savedRepos]);

  const toggleSaveRepo = (name, url, isPrivate) => {
    setSavedRepos((prev) => {
      const exists = prev.some((r) => r.url === url);
      if (exists) {
        return prev.filter((r) => r.url !== url);
      } else {
        return [...prev, { name, url, requiresToken: isPrivate }];
      }
    });
  };
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardRect, setWizardRect] = useState(null);
  const wizardGuideOpenedForStep = useRef(-1);
  const [readingOptions, setReadingOptions] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("repo-reading-options")) || {};
      delete saved.spacing;
      if (typeof saved.size === "number") {
        const oldIncrease = saved.size > 0 && saved.size < 2 ? Math.max(0, Math.round(((saved.size - 1) * 10) / 2) * 2) : saved.size;
        saved.fontSize = 12 + oldIncrease;
        delete saved.size;
      }
      return saved;
    } catch { return {}; }
  });
  const t = STRINGS[lang];
  const data = map || DEFAULT_MAP;
  const browserLang = useMemo(() => (navigator.language || navigator.languages?.[0] || "en").split("-")[0].toLowerCase(), []);
  const selectedCode = selectedPath ? data.fileContents?.[selectedPath] : null;
  const selectedIsFile = Boolean(selectedPath && data.files?.includes(selectedPath));
  const readingFontSize = Math.max(8, Math.min(32, Number(readingOptions.fontSize) || 12));
  const readingActive = readingFontSize !== 12 || Object.entries(readingOptions).some(([key, value]) => key !== "fontSize" && Boolean(value));

  useEffect(() => {
    window.localStorage.setItem("repo-tree-width", String(treeWidth));
  }, [treeWidth]);

  useEffect(() => {
    window.localStorage.setItem("repo-inspector-width", String(inspectorWidth));
  }, [inspectorWidth]);

  const inspectorOpen = Boolean(selected || (selectedPath && (map || true)));
  const prevInspectorOpen = useRef(false);
  useEffect(() => {
    if (!flow || inspectorOpen === prevInspectorOpen.current) return;
    prevInspectorOpen.current = inspectorOpen;
    const id = setTimeout(() => flow.fitView({ padding: 0.12, duration: 380 }), 80);
    return () => clearTimeout(id);
  }, [inspectorOpen, flow]);

  const prevDataRef = useRef(null);
  useEffect(() => {
    if (!flow || data === prevDataRef.current) return;
    prevDataRef.current = data;
    const id = setTimeout(() => flow.fitView({ padding: 0.12, duration: 380 }), 300);
    return () => clearTimeout(id);
  }, [data, flow]);

  useEffect(() => {
    window.localStorage.setItem("repo-reading-options", JSON.stringify(readingOptions));
  }, [readingOptions]);

  useEffect(() => {
    if (!langPickerOpen) return;
    const close = (e) => { if (!e.target.closest(".lang-picker-wrap")) setLangPickerOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [langPickerOpen]);

  useEffect(() => {
    setExplanationLevel(0);
  }, [selected?.id, selectedPath]);

  useLayoutEffect(() => {
    if (!wizardOpen) { setWizardRect(null); return; }
    const step = WIZARD_STEPS[lang][wizardStep];
    if (!step) return;
    if (step.openGuide && !guideOpen && wizardGuideOpenedForStep.current !== wizardStep) {
      wizardGuideOpenedForStep.current = wizardStep;
      setGuideOpen(true);
      return;
    }
    const target = step.target;
    if (!target) { setWizardRect(null); return; }
    const el = document.querySelector(target);
    setWizardRect(el ? el.getBoundingClientRect() : null);
  }, [wizardOpen, wizardStep, lang, guideOpen]);

  useEffect(() => {
    let timer = null;
    const show = (event) => {
      const target = event.target.closest?.(".has-tooltip[data-tooltip]");
      if (!target) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const label = target.dataset.tooltip;
        if (!label) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 10;
        const approxWidth = Math.min(220, Math.max(120, label.length * 7 + 20));
        const approxHeight = 36;

        let x, y, transform = "translateY(-50%)";

        // Near right edge of viewport -> flip to left side
        if (rect.right + approxWidth + margin > vw) {
          x = rect.left - approxWidth - 10;
          if (x < margin) x = margin;
          y = rect.top + rect.height / 2;
        } else {
          x = rect.right + 8;
          y = rect.top + rect.height / 2;
        }

        // Clamp y to viewport height
        if (y + approxHeight / 2 > vh - margin) {
          y = Math.max(margin, vh - approxHeight - margin);
          transform = "none";
        } else if (y - approxHeight / 2 < margin) {
          y = margin;
          transform = "none";
        }

        // Clamp x strictly within screen boundaries
        x = Math.max(margin, Math.min(x, vw - approxWidth - margin));

        setTooltip({
          label,
          x,
          y,
          transform,
        });
      }, 150);
    };
    const hide = (event) => {
      const target = event.target.closest?.(".has-tooltip[data-tooltip]");
      if (target && event.relatedTarget && target.contains(event.relatedTarget)) return;
      clearTimeout(timer);
      setTooltip(null);
    };
    document.addEventListener("mouseover", show);
    document.addEventListener("mouseout", hide);
    document.addEventListener("focusin", show);
    document.addEventListener("focusout", hide);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseover", show);
      document.removeEventListener("mouseout", hide);
      document.removeEventListener("focusin", show);
      document.removeEventListener("focusout", hide);
    };
  }, []);

  useEffect(() => {
    if (!resizingTree) return undefined;
    const onMove = (event) => setTreeWidth(Math.max(260, Math.min(event.clientX, Math.min(680, window.innerWidth * 0.58))));
    const onUp = () => setResizingTree(false);
    document.body.classList.add("is-resizing");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      document.body.classList.remove("is-resizing");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizingTree]);

  useEffect(() => {
    if (!resizingInspector) return undefined;
    const onMove = (event) => setInspectorWidth(Math.max(280, Math.min(window.innerWidth - event.clientX, Math.min(680, window.innerWidth * 0.55))));
    const onUp = () => setResizingInspector(false);
    document.body.classList.add("is-resizing");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      document.body.classList.remove("is-resizing");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizingInspector]);
  const { lanes, nodes: layoutNodes } = useMemo(() => buildLayout(data, lang), [data, lang]);

  const { categoryNodeIds, categoryFilePaths } = useMemo(() => {
    if (!activeCategory) return { categoryNodeIds: new Set(), categoryFilePaths: new Set() };
    const nodeIds = new Set();
    const filePaths = new Set();

    data.nodes.forEach((node) => {
      let match = false;
      const tag = node.tag;
      const layer = node.layer;

      if (activeCategory === "components") {
        if (tag === "component" || layer === "components" || layer === "ui") match = true;
      } else if (activeCategory === "patterns") {
        if (tag === "pattern" || layer === "patterns") match = true;
      } else if (activeCategory === "layouts") {
        if (tag === "layout" || tag === "template" || layer === "layouts") match = true;
      } else if (activeCategory === "pages") {
        if (tag === "page" || layer === "pages") match = true;
      } else if (activeCategory === "tokens") {
        if (tag === "token" || layer === "tokens" || layer === "foundation") match = true;
      } else if (activeCategory === "styles") {
        const hasStyles = node.files?.some(f => /\.(css|scss|sass|less|styl)$/i.test(f));
        if (hasStyles) match = true;
      } else if (activeCategory === "documentation") {
        if (["rule", "skill", "doc"].includes(tag) || layer === "docs") match = true;
      } else if (activeCategory === "stories") {
        if (tag === "story" || layer === "stories") match = true;
      } else if (activeCategory === "icons") {
        const isIconNode = tag === "icon" || layer === "icons" || node.files?.some(f => /(?:^|\/)(?:icons?|iconography|assets\/icons?|src\/icons?)(\/|$)/i.test(f) || /(?:^|\/)[A-Za-z0-9_-]*icon[A-Za-z0-9_-]*\.(tsx?|jsx?|vue|svelte|svg)$/i.test(f));
        if (isIconNode) match = true;
      }

      if (match) {
        nodeIds.add(node.id);
        node.files?.forEach(f => filePaths.add(f));
      }
    });

    data.files?.forEach((filePath) => {
      const lower = filePath.toLowerCase();
      const ext = filePath.split(".").pop().toLowerCase();
      if (activeCategory === "components") {
        if (/(^|\/)(components?|ui)\//i.test(filePath) && ["js", "jsx", "ts", "tsx", "vue", "svelte"].includes(ext)) filePaths.add(filePath);
      } else if (activeCategory === "tokens") {
        if (/(^|\/)(tokens?|variables?|theme|primitives?|semantic|foundations?)(\/|\.|-)/i.test(filePath)) filePaths.add(filePath);
      } else if (activeCategory === "pages") {
        if (/(^|\/)(pages?|screens?|views?|routes?|app)\//i.test(filePath) && ["js", "jsx", "ts", "tsx", "vue", "svelte"].includes(ext)) filePaths.add(filePath);
      } else if (activeCategory === "layouts") {
        if (/(^|\/)(layouts?|shells?)\//i.test(filePath) || /layout\.(jsx?|tsx?|vue|svelte|erb)$/i.test(filePath)) filePaths.add(filePath);
      } else if (activeCategory === "stories") {
        if (/\.stories\./i.test(filePath)) filePaths.add(filePath);
      } else if (activeCategory === "patterns") {
        if (/(^|\/)(patterns?|recipes?|templates?)\//i.test(filePath)) filePaths.add(filePath);
      } else if (activeCategory === "documentation") {
        if (/(^|\/)docs?\//i.test(filePath) || /^(readme|agents|claude)\.md$/i.test(filePath.split("/").pop())) filePaths.add(filePath);
      } else if (activeCategory === "styles") {
        if (["css", "scss", "sass", "less", "styl"].includes(ext)) filePaths.add(filePath);
      } else if (activeCategory === "icons") {
        const isIconFile = /(?:^|\/)(?:icons?|iconography|assets\/icons?|src\/icons?)(\/|$)/i.test(filePath) || /(?:^|\/)[A-Za-z0-9_-]*icon[A-Za-z0-9_-]*\.(tsx?|jsx?|vue|svelte|svg)$/i.test(filePath);
        const EXCLUDED_ASSET_PATTERN = /(?:logo|brand|partner|wordmark|illustration|marketing|artwork|banner|hero|photo|screenshot|empty-state|favicon|apple-touch-icon|app-icon|launcher)/i;
        if (isIconFile && !EXCLUDED_ASSET_PATTERN.test(filePath)) filePaths.add(filePath);
      }
    });

    return { categoryNodeIds: nodeIds, categoryFilePaths: filePaths };
  }, [data, activeCategory]);

  useEffect(() => {
    if (activeCategory && flow && categoryNodeIds.size > 0) {
      const nodesToFit = flow.getNodes().filter((n) => categoryNodeIds.has(n.id));
      if (nodesToFit.length > 0) {
        flow.fitView({ nodes: nodesToFit, duration: 400, padding: 0.12 });
      }
    }
  }, [activeCategory, categoryNodeIds, flow]);

  const nodeMeta = useMemo(() => Object.fromEntries(data.nodes.map((node) => [node.id, node])), [data.nodes]);
  const hasFocus = relatedIds.size > 0 || categoryNodeIds.size > 0;
  const nodes = useMemo(() => [
    ...lanes.map((lane) => ({
      id: `lane-${lane.id}`, type: "lane", position: { x: 0, y: lane.top }, width: lane.width, height: lane.height,
      data: { label: lane.label, sub: lane.sub, color: lane.color, width: lane.width, height: lane.height, layer: lane.id },
      selectable: false, draggable: false, zIndex: -1,
    })),
    ...layoutNodes.map((node) => {
      const layerColor = lanes.find((l) => l.id === node.data.layer)?.color || "#a78bfa";
      const isSelected = relatedIds.has(node.id) || categoryNodeIds.has(node.id);
      return {
        ...node,
        draggable: false,
        data: {
          ...node.data,
          color: layerColor,
          selected: isSelected,
          dimmed: hasFocus && !isSelected,
          what: nodeMeta[node.id]?.what || "",
          does: nodeMeta[node.id]?.does || "",
        },
      };
    }),
  ], [lanes, layoutNodes, relatedIds, categoryNodeIds, hasFocus, nodeMeta]);

  const edges = useMemo(() => {
    const targetCounts = {};
    const seenLabels = new Set(); // deduplicate: same verb+color shows only once
    return data.edges.map((edge) => {
      const active = relatedIds.has(edge.source) || relatedIds.has(edge.target) || categoryNodeIds.has(edge.source) || categoryNodeIds.has(edge.target);
      const tgt = edge.target;
      targetCounts[tgt] = (targetCounts[tgt] || 0) + 1;
      const index = targetCounts[tgt] - 1;
      const labelOffsetY = -14 - index * 18;
      const labelKey = `${edge.verb}|${edge.color}`;
      const hideLabel = seenLabels.has(labelKey);
      if (!hideLabel) seenLabels.add(labelKey);
      return styledEdge(edge, active, hasFocus && !active, labelOffsetY, hideLabel);
    });
  }, [data.edges, relatedIds, categoryNodeIds, hasFocus]);

  const focusCard = useCallback((id) => {
    setActiveCategory(null);
    const meta = nodeMeta[id];
    if (!meta) return;
    setRelatedIds(new Set([id]));
    setSelected(meta);
    setSelectedPath(meta.files?.[0] || "");
    setSelectedIsFolder(false);
    if (flow) {
      const flowNode = flow.getNode(id);
      if (flowNode) {
        const x = flowNode.position.x + (flowNode.measured?.width || flowNode.width || 250) / 2;
        const y = flowNode.position.y + (flowNode.measured?.height || flowNode.height || 64) / 2;
        flow.setCenter(x, y, { zoom: 1.5, duration: 400 });
      }
    }
  }, [nodeMeta, flow]);

  const selectPath = useCallback((path, isFolder = false) => {
    setActiveCategory(null);
    setSelectedPath(path);
    setSelectedIsFolder(isFolder);
    const matches = data.nodes.filter((node) => node.files?.some((file) =>
      isFolder ? file === path || file.startsWith(`${path}/`) : file === path
    ));
    const ids = new Set(matches.map((node) => node.id));
    setRelatedIds(ids);
    const matchedNode = matches[0];
    setSelected(matchedNode || null);
    if (matchedNode && flow) {
      const flowNode = flow.getNode(matchedNode.id);
      if (flowNode) {
        const x = flowNode.position.x + (flowNode.measured?.width || flowNode.width || 250) / 2;
        const y = flowNode.position.y + (flowNode.measured?.height || flowNode.height || 64) / 2;
        flow.setCenter(x, y, { zoom: 1.4, duration: 400 });
      }
    }
  }, [data.nodes, flow]);

  const repoMenuFiltered = useMemo(() => {
    const q = repoUrl.trim().toLowerCase();
    return {
      saved: savedRepos.filter(r => !q || r.url.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)),
      recent: recentSearches.filter(u => !q || u.toLowerCase().includes(q)),
      design: DESIGN_REPOS.filter(r => !q || r.url.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)),
    };
  }, [repoUrl, savedRepos, recentSearches]);

  const analyzeRepo = async (urlOverride, customToken) => {
    const url = (typeof urlOverride === "string" ? urlOverride : repoUrl).trim();
    if (!url || busy) return;
    setRepoUrl(url);
    setRepoMenuOpen(false);
    setBusy(true);
    setProgress(8);
    setErr(null);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 94;
        return prev + Math.floor(Math.random() * 8 + 4);
      });
    }, 180);

    const tokenToSend = customToken !== undefined ? customToken : gitToken;
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url, token: tokenToSend || undefined }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        clearInterval(progressTimer);
        setProgress(0);
        if (result.error && result.error.includes("AUTH_REQUIRED")) {
          setBusy(false);
          setModalToken(gitToken);
          setTokenModalOpen(true);
          return;
        }
        throw new Error(result.error || "Error");
      }
      
      clearInterval(progressTimer);
      setProgress(100);

      setRecentSearches((prev) => {
        const next = [url, ...prev.filter((u) => u !== url)].slice(0, 4);
        window.localStorage.setItem("recent-searches", JSON.stringify(next));
        return next;
      });

      setTimeout(() => {
        setBusy(false);
        setProgress(0);
        startTransition(() => {
          setMap(result);
          setSelected(null);
          setSelectedPath("");
          setRelatedIds(new Set());
          setGuideOpen(true);
        });
      }, 250);
      return;
    } catch (error) {
      clearInterval(progressTimer);
      setProgress(0);
      setErr(error.message === "AUTH_REQUIRED" ? (lang === "es" ? "El repositorio requiere autenticación." : "Repository requires authentication.") : error.message);
    }
    setBusy(false);
  };

  const resetMap = () => {
    setMap(null);
    setRepoUrl("");
    setErr(null);
    setSelected(null);
    setSelectedPath("");
    setRelatedIds(new Set());
    setGuideOpen(false);
  };

  return (
    <div className={`app reading-size${readingOptions.font ? " reading-font" : ""}${readingOptions.contrast ? " reading-contrast" : ""}${readingOptions.tint ? " reading-tint" : ""}${readingOptions.focus ? " reading-focus" : ""}`} style={{ "--reading-base-size": `${readingFontSize}px` }}>
      <header className="topbar">
        <div className="brand">
          <div>
            <h1>{t.title}</h1>
          </div>
        </div>
        <div className="repo-row">
          <div className={"repo-input-wrap" + (gitToken ? " has-token" : "")}>
            <input
              className="repo-input"
              value={repoUrl}
              placeholder={t.repoPlaceholder}
              onChange={(event) => { setRepoUrl(event.target.value); setRepoMenuOpen(true); }}
              onFocus={() => setRepoMenuOpen(true)}
              onKeyDown={(event) => { if (event.key === "Enter") { setRepoMenuOpen(false); analyzeRepo(); } if (event.key === "Escape") setRepoMenuOpen(false); }}
              spellCheck={false}
            />
            {repoUrl && <button className="repo-clear-btn has-tooltip" aria-label={lang === "es" ? "Limpiar búsqueda" : "Clear search"} data-tooltip={lang === "es" ? "Limpiar" : "Clear"} onClick={() => { setRepoUrl(""); setRepoMenuOpen(false); }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
            </button>}


            {requiresToken(repoUrl) && (
              <button
                className="repo-token-toggle has-tooltip"
                style={{ right: map ? "60px" : "32px" }}
                aria-label={lang === "es" ? "Modificar token de GitHub" : "Modify GitHub token"}
                data-tooltip={lang === "es" ? "Modificar token" : "Modify token"}
                onClick={() => {
                  setModalToken(gitToken);
                  setTokenModalOpen(true);
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 0-7.778 7.778 5.5 5.5 0 0 0 7.777-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              </button>
            )}
            
            <button className="repo-menu-toggle has-tooltip" aria-expanded={repoMenuOpen} aria-label={lang === "es" ? "Elegir un sistema de diseño abierto" : "Choose an open-source design system"} data-tooltip={lang === "es" ? "Elegir repositorio" : "Choose repository"} onClick={() => { setRepoMenuOpen((value) => !value); }}><span aria-hidden="true" className="dropdown-chevron" /></button>
            
            {repoMenuOpen && (
              <div className="repo-menu">
                {!repoMenuFiltered.saved.length && !repoMenuFiltered.recent.length && !repoMenuFiltered.design.length && (
                  <div className="tree-no-results-empty">
                    <div className="empty-search-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <strong>{lang === "es" ? "Sin resultados" : "No results"}</strong>
                    <span>{lang === "es" ? "No encontramos repositorios que coincidan con tu búsqueda." : "No repositories matched your search."}</span>
                  </div>
                )}
                {repoMenuFiltered.saved.length > 0 && (
                  <>
                    <span>{lang === "es" ? "Guardados" : "Saved"}</span>
                    {repoMenuFiltered.saved.map((repo) => (
                      <div key={repo.url} className="repo-menu-item">
                        <button className="repo-menu-item-left" onClick={() => { setRepoUrl(repo.url); setRepoMenuOpen(false); analyzeRepo(repo.url); }}>
                          <strong>{repo.name}</strong>
                        </button>
                        <div className="repo-menu-item-actions">
                          {repo.requiresToken && (
                            <button className="repo-action-btn is-key" onClick={(e) => { e.stopPropagation(); setRepoUrl(repo.url); setModalToken(gitToken); setTokenModalOpen(true); }} title={lang === "es" ? "Configurar token" : "Configure token"}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 0-7.778 7.778 5.5 5.5 0 0 0 7.777-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                            </button>
                          )}
                          <button className="repo-action-btn is-active" onClick={(e) => { e.stopPropagation(); toggleSaveRepo(repo.name, repo.url, repo.requiresToken); }} title={lang === "es" ? "Quitar de guardados" : "Remove from saved"}>★</button>
                        </div>
                      </div>
                    ))}
                    <hr style={{ margin: "4px 0", border: 0, borderTop: "1px solid var(--line)" }} />
                  </>
                )}
                {repoMenuFiltered.recent.length > 0 && (
                  <>
                    <span>{lang === "es" ? "Búsquedas recientes" : "Recent searches"}</span>
                    {repoMenuFiltered.recent.map((url) => {
                      const repoName = url.replace("https://github.com/", "");
                      const isSaved = savedRepos.some((r) => r.url === url);
                      const isPrivate = requiresToken(url);
                      return (
                        <div key={url} className="repo-menu-item">
                          <button className="repo-menu-item-left" onClick={() => { setRepoUrl(url); setRepoMenuOpen(false); analyzeRepo(url); }}>
                            <strong>{repoName}</strong>
                          </button>
                          <div className="repo-menu-item-actions">
                            {isPrivate && (
                              <button className="repo-action-btn is-key" onClick={(e) => { e.stopPropagation(); setRepoUrl(url); setModalToken(gitToken); setTokenModalOpen(true); }} title={lang === "es" ? "Configurar token" : "Configure token"}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 0-7.778 7.778 5.5 5.5 0 0 0 7.777-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                              </button>
                            )}
                            <button className={"repo-action-btn" + (isSaved ? " is-active" : "")} onClick={(e) => { e.stopPropagation(); toggleSaveRepo(repoName, url, isPrivate); }} title={isSaved ? (lang === "es" ? "Quitar de guardados" : "Remove from saved") : (lang === "es" ? "Guardar repositorio" : "Save repository")}>{isSaved ? "★" : "☆"}</button>
                          </div>
                        </div>
                      );
                    })}
                    <hr style={{ margin: "4px 0", border: 0, borderTop: "1px solid var(--line)" }} />
                  </>
                )}
                {repoMenuFiltered.design.length > 0 && (
                  <>
                    <span>{lang === "es" ? "Design Systems Open Source" : "Open Source Design Systems"}</span>
                    {repoMenuFiltered.design.map((repo) => {
                      const isSaved = savedRepos.some((r) => r.url === repo.url);
                      const isPrivate = requiresToken(repo.url);
                      return (
                        <div key={repo.url} className="repo-menu-item">
                          <button className="repo-menu-item-left" onClick={() => { setRepoUrl(repo.url); setRepoMenuOpen(false); analyzeRepo(repo.url); }}>
                            <strong>{repo.name}</strong>
                          </button>
                          <div className="repo-menu-item-actions">
                            {isPrivate && (
                              <button className="repo-action-btn is-key" onClick={(e) => { e.stopPropagation(); setRepoUrl(repo.url); setModalToken(gitToken); setTokenModalOpen(true); }} title={lang === "es" ? "Configurar token" : "Configure token"}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 0-7.778 7.778 5.5 5.5 0 0 0 7.777-7.778zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                              </button>
                            )}
                            <button className={"repo-action-btn" + (isSaved ? " is-active" : "")} onClick={(e) => { e.stopPropagation(); toggleSaveRepo(repo.name, repo.url, isPrivate); }} title={isSaved ? (lang === "es" ? "Quitar de guardados" : "Remove from saved") : (lang === "es" ? "Guardar repositorio" : "Save repository")}>{isSaved ? "★" : "☆"}</button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
          <button className="repo-btn" onClick={() => analyzeRepo()} aria-busy={busy}>{t.repoButton}</button>
          {err && <span className="repo-err">{err}</span>}
        </div>
        <div className="lang-switch" aria-label="Language / Idioma">
          <div className="reading-settings">
            <button className={"dyslexia-toggle has-tooltip" + (readingActive ? " active" : "")} aria-expanded={readingMenuOpen} aria-label={lang === "es" ? "Opciones de lectura para dislexia" : "Dyslexia reading options"} data-tooltip={lang === "es" ? "Opciones de lectura" : "Reading options"} onClick={() => setReadingMenuOpen((value) => !value)}>Aa</button>
            {readingMenuOpen && <div className="reading-menu">
              <div className="reading-menu-head"><strong>{lang === "es" ? "Ayudas de lectura" : "Reading aids"}</strong><small>{lang === "es" ? "Puedes combinar varias" : "Choose more than one"}</small></div>
              <div className="reading-size-control">
                <strong>{lang === "es" ? "Tamaño base del texto" : "Base text size"}</strong>
                <div className="font-size-stepper">
                  <button className="has-tooltip" data-tooltip={lang === "es" ? "Reducir 2 píxeles" : "Decrease 2 pixels"} aria-label={lang === "es" ? "Reducir texto dos píxeles" : "Decrease text by two pixels"} onClick={() => setReadingOptions((options) => ({ ...options, fontSize: Math.max(8, readingFontSize - 2) }))}>−</button>
                  <label><input type="number" min="8" max="32" step="1" value={readingFontSize} onChange={(event) => setReadingOptions((options) => ({ ...options, fontSize: Math.max(8, Math.min(32, Number(event.target.value) || 12)) }))} aria-label={lang === "es" ? "Tamaño base personalizado" : "Custom base size"} /></label>
                  <button className="has-tooltip" data-tooltip={lang === "es" ? "Aumentar 2 píxeles" : "Increase 2 pixels"} aria-label={lang === "es" ? "Aumentar texto dos píxeles" : "Increase text by two pixels"} onClick={() => setReadingOptions((options) => ({ ...options, fontSize: Math.min(32, readingFontSize + 2) }))}>+</button>
                </div>
              </div>
              {[
                ["font", lang === "es" ? "Tipografía accesible" : "Accessible type", lang === "es" ? "Formas de letra más fáciles de distinguir" : "Letter shapes that are easier to tell apart"],
                ["contrast", lang === "es" ? "Contraste alto" : "High contrast", lang === "es" ? "Oscurece el texto secundario" : "Darkens secondary text"],
                ["tint", lang === "es" ? "Fondo cálido" : "Warm background", lang === "es" ? "Reduce el blanco brillante" : "Reduces bright white"],
                ["focus", lang === "es" ? "Enfoque de lectura" : "Reading focus", lang === "es" ? "Destaca el bloque sobre el que pasas" : "Highlights the block under the pointer"],
              ].map(([key, label, help]) => <button key={key} role="checkbox" aria-checked={Boolean(readingOptions[key])} className={readingOptions[key] ? "selected" : ""} onClick={() => setReadingOptions((options) => ({ ...options, [key]: !options[key] }))}><span className="reading-check">{readingOptions[key] ? "✓" : ""}</span><span><strong>{label}</strong><small>{help}</small></span></button>)}
              {readingActive && <button className="reading-reset" onClick={() => setReadingOptions({})}>{lang === "es" ? "Restablecer opciones" : "Reset options"}</button>}
            </div>}
          </div>
          <div className="lang-picker-wrap">
            {(() => {
              const current = WORLD_LANGUAGES.find(l => l.code === lang) || WORLD_LANGUAGES[0];
              const browserLangEntry = WORLD_LANGUAGES.find(l => l.code === browserLang);
              const term = langSearch.trim().toLowerCase();
              const filtered = term
                ? WORLD_LANGUAGES.filter(l => l.name.toLowerCase().includes(term) || l.native.toLowerCase().includes(term) || l.code.includes(term))
                : WORLD_LANGUAGES;
              return (<>
                <button
                  className="lang-picker-btn has-tooltip"
                  data-tooltip={lang === "es" ? "Cambiar idioma" : "Change language"}
                  aria-expanded={langPickerOpen}
                  aria-label={lang === "es" ? "Seleccionar idioma" : "Select language"}
                  onClick={() => { setLangPickerOpen(v => !v); setLangSearch(""); }}
                >
                  <span className="lang-picker-code">{current.code.toUpperCase()}</span>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,3 5,7 8,3"/></svg>
                </button>
                {langPickerOpen && (
                  <div className="lang-picker-dropdown" role="listbox" aria-label={lang === "es" ? "Idiomas disponibles" : "Available languages"}>
                    <div className="lang-picker-search-wrap">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        autoFocus
                        type="text"
                        value={langSearch}
                        onChange={e => setLangSearch(e.target.value)}
                        placeholder={lang === "es" ? "Buscar idioma…" : "Search language…"}
                        aria-label={lang === "es" ? "Buscar idioma" : "Search language"}
                      />
                      {langSearch && <button className="lang-picker-clear" onClick={() => setLangSearch("")}>×</button>}
                    </div>
                    <div className="lang-picker-list">
                      {!term && browserLangEntry && (<>
                        <button key={browserLangEntry.code} role="option" aria-selected={lang === browserLangEntry.code} className={"lang-picker-item" + (lang === browserLangEntry.code ? " active" : "")} onClick={() => { setLang(browserLangEntry.code); setLangPickerOpen(false); setLangSearch(""); }}>
                          <span className="lang-picker-names"><strong>{browserLangEntry.native}</strong></span>
                          {lang === browserLangEntry.code && <span className="lang-picker-check">✓</span>}
                        </button>
                        <div className="lang-picker-separator" />
                      </>)}
                      {filtered.map(l => (
                        <button key={l.code} role="option" aria-selected={lang === l.code} className={"lang-picker-item" + (lang === l.code ? " active" : "")} onClick={() => { setLang(l.code); setLangPickerOpen(false); setLangSearch(""); }}>
                          <span className="lang-picker-names"><strong>{l.native}</strong></span>
                          {lang === l.code && <span className="lang-picker-check">✓</span>}
                        </button>
                      ))}
                      {term && filtered.length === 0 && <div className="lang-picker-empty">{lang === "es" ? "Sin resultados" : "No results"}</div>}
                    </div>
                  </div>
                )}
              </>);
            })()}
          </div>
        </div>
      </header>

      <main className={"workspace" + (selectedIsFile ? " code-open" : "")} style={{ "--tree-width": `${treeWidth}px`, "--inspector-width": `${inspectorWidth}px` }}>
        <RepoTree files={data.files || []} repoName={data.repoName} selectedPath={selectedPath} onSelect={selectPath} lang={lang} highlightedPaths={categoryFilePaths} />
        <div
          className="panel-resizer"
          role="separator"
          aria-label={lang === "es" ? "Redimensionar árbol del repositorio" : "Resize repository tree"}
          aria-orientation="vertical"
          aria-valuemin="260"
          aria-valuemax="680"
          aria-valuenow={Math.round(treeWidth)}
          tabIndex={0}
          onPointerDown={(event) => { event.preventDefault(); setResizingTree(true); }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setTreeWidth((width) => Math.max(260, width - 24));
            if (event.key === "ArrowRight") setTreeWidth((width) => Math.min(680, width + 24));
          }}
        ><span /></div>
        <section className="visual-pane">
          <div className="pane-heading map-heading">
            <div><span className="pane-kicker">{t.map}</span><h2>{data.repoName}</h2></div>
          </div>
          <div className="graph">
            {busy && (
              <div className="loading-overlay">
                <div className="progress-bar-box">
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(5, progress))}%` }} />
                  </div>
                  <span className="progress-num">{Math.round(progress)}%</span>
                </div>
                <p>
                  {t.repoAnalyzing}
                  <br />
                  <span className="loading-sub">{t.repoAnalyzingSub}</span>
                </p>
              </div>
            )}
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodeClick={(_, node) => { setActiveCategory(null); node.type === "chip" && focusCard(node.id); }} onInit={setFlow} onPaneClick={() => { setRelatedIds(new Set()); setSelected(null); setActiveCategory(null); }} fitView fitViewOptions={{ padding: 0.12 }} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }} colorMode="light">
              <Background color="#d9d6e4" gap={24} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </section>

        {(selected || selectedIsFile || selectedIsFolder) && <div className="inspector-resizer" role="separator" aria-label={lang === "es" ? "Redimensionar panel derecho" : "Resize right panel"} aria-orientation="vertical" aria-valuemin="280" aria-valuemax="680" aria-valuenow={Math.round(inspectorWidth)} tabIndex={0} onPointerDown={(event) => { event.preventDefault(); setResizingInspector(true); }} onKeyDown={(event) => { if (event.key === "ArrowLeft") setInspectorWidth((width) => Math.min(680, width + 24)); if (event.key === "ArrowRight") setInspectorWidth((width) => Math.max(280, width - 24)); }}><span /></div>}
        {(selected || selectedIsFile || selectedIsFolder) && (
          <aside className={"inspector" + ((selectedIsFile || selectedIsFolder) ? " code-inspector" : "")}>
            <button className="icon-btn inspector-close has-tooltip" data-tooltip={lang === "es" ? "Cerrar panel" : "Close panel"} aria-label={lang === "es" ? "Cerrar panel" : "Close panel"} onClick={() => { setSelected(null); setSelectedPath(""); setSelectedIsFolder(false); setRelatedIds(new Set()); setActiveCategory(null); }}>×</button>
            {selectedIsFile ? (
              <>
                <span className="pane-kicker">{lang === "es" ? "ARCHIVO DEL SISTEMA DE DISEÑO" : "DESIGN SYSTEM FILE"}</span>
                <h2 className="code-file-name">{selectedPath.split("/").pop()}</h2>
                <p className="inspector-sub code-path">{selectedPath}</p>

                <FileVisualPreview path={selectedPath} content={selectedCode} lang={lang} />

                <div className="inspector-block">
                  <span>{lang === "es" ? "QUÉ ES Y QUÉ CONTIENE" : "WHAT IT IS & CONTAINS"}</span>
                  <p>{getFileExplanation(selectedPath, lang, selected, selectedCode)}</p>
                </div>

                <div className="file-details-grid">
                  <div className="file-detail-item">
                    <small>{lang === "es" ? "Tipo / Lenguaje" : "Type / Language"}</small>
                    <strong>{codeLanguage(selectedPath)}</strong>
                  </div>
                  <div className="file-detail-item">
                    <small>{lang === "es" ? "Líneas de código" : "Code lines"}</small>
                    <strong>{selectedCode == null ? "—" : `${selectedCode.split("\n").length}`}</strong>
                  </div>
                </div>

                <div className={"code-shell" + (/\.(md|mdx)$/i.test(selectedPath) ? " is-markdown" : "")}>
                  <div className="code-toolbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{codeLanguage(selectedPath)}</span>
                      <span>{selectedCode == null ? "—" : `${selectedCode.split("\n").length} ${lang === "es" ? "líneas" : "lines"}`}</span>
                    </div>
                    {selectedCode != null && (
                      <div className="code-toolbar-actions">
                        <button
                          type="button"
                          className="code-action-btn has-tooltip"
                          data-tooltip={lang === "es" ? "Descargar archivo" : "Download file"}
                          aria-label={lang === "es" ? "Descargar archivo" : "Download file"}
                          onClick={() => downloadSelectedFile(selectedPath.split("/").pop(), selectedCode)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="code-action-btn has-tooltip"
                          data-tooltip={lang === "es" ? "Expandir a pantalla completa" : "Expand to fullscreen"}
                          aria-label={lang === "es" ? "Expandir a pantalla completa" : "Expand to fullscreen"}
                          onClick={() => setDocFullscreenOpen(true)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9"/>
                            <polyline points="9 21 3 21 3 15"/>
                            <line x1="21" y1="3" x2="14" y2="10"/>
                            <line x1="3" y1="21" x2="10" y2="14"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {selectedCode != null ? <pre className="code-view"><code>{selectedCode}</code></pre> : <div className="code-unavailable">{lang === "es" ? "La vista previa no está disponible para este archivo binario o de gran tamaño." : "Preview is unavailable for this binary or large file."}</div>}
                </div>
                {selected && <div className="code-context"><span>{lang === "es" ? "RELACIONADO CON" : "RELATED TO"}</span><strong>{selected.title}</strong><p>{explanationLevel > 0 ? alternateExplanation(selected, lang, explanationLevel) : whatFor(selected, lang)}</p><ExplanationActions lang={lang} level={explanationLevel} onAlternate={() => setExplanationLevel((level) => Math.min(3, level + 1))} onReset={() => setExplanationLevel(0)} /></div>}
              </>
            ) : selectedIsFolder ? (
              <>
                <span className="pane-kicker">{lang === "es" ? "CARPETA DEL PROYECTO" : "PROJECT FOLDER"}</span>
                <h2 className="code-file-name">{selectedPath.split("/").pop()}</h2>
                <p className="inspector-sub code-path">{selectedPath}</p>
                <div className="inspector-block">
                  <span>{lang === "es" ? "QUÉ ES Y QUÉ CONTIENE" : "WHAT IT IS & CONTAINS"}</span>
                  <p>{getFolderExplanation(selectedPath, lang)}</p>
                </div>
                {selected && <div className="code-context"><span>{lang === "es" ? "RELACIONADO CON" : "RELATED TO"}</span><strong>{selected.title}</strong><p>{explanationLevel > 0 ? alternateExplanation(selected, lang, explanationLevel) : whatFor(selected, lang)}</p><ExplanationActions lang={lang} level={explanationLevel} onAlternate={() => setExplanationLevel((level) => Math.min(3, level + 1))} onReset={() => setExplanationLevel(0)} /></div>}
              </>
            ) : selected ? (
              <>
                <span className="pane-kicker">{data.layers.find((layer) => layer.id === selected.layer)?.label}</span>
                <h2>{selected.title}</h2>
                <p className="inspector-sub">{subFor(selected, lang)}</p>
                {selected.files?.length > 0 && <div className="linked-files">{selected.files.map((file) => <button key={file} onClick={() => selectPath(file, false)}>↳ {file}</button>)}</div>}
                {explanationLevel > 0 ? <div className="alternate-explanation"><span>{lang === "es" ? `EXPLICACIÓN ${explanationLevel} DE 3` : `EXPLANATION ${explanationLevel} OF 3`}</span><p>{alternateExplanation(selected, lang, explanationLevel)}</p></div> : <><div className="inspector-block"><span>{t.what}</span><p>{whatFor(selected, lang)}</p></div>{selected.does && <div className="inspector-block"><span>{t.does}</span><p>{doesFor(selected, lang)}</p></div>}</>}
                <ExplanationActions lang={lang} level={explanationLevel} onAlternate={() => setExplanationLevel((level) => Math.min(3, level + 1))} onReset={() => setExplanationLevel(0)} />
              </>
            ) : null}
          </aside>
        )}
      </main>

      <ProjectGuide data={data} lang={lang} selectedPath={selectedPath} open={guideOpen} onClose={() => setGuideOpen(false)} onSelectPath={selectPath} activeCategory={activeCategory} onSelectCategory={setActiveCategory} repoUrl={repoUrl} />

      {!guideOpen && (
        <button 
          className="guide-fab has-tooltip" 
          onClick={() => setGuideOpen(true)}
          data-tooltip={lang === "es" ? "Abrir guía de onboarding" : "Open onboarding guide"}
          aria-label={lang === "es" ? "Abrir guía de onboarding" : "Open onboarding guide"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </button>
      )}

      {wizardOpen && (() => {
        const step = WIZARD_STEPS[lang][wizardStep];
        const total = WIZARD_STEPS[lang].length;
        const closeWizard = () => setWizardOpen(false);
        const modalContent = (
          <>
            <button className="wizard-close" aria-label={lang === "es" ? "Cerrar" : "Close"} onClick={closeWizard}>×</button>
            <div className="wizard-body">
              <div className="wizard-icon">{step.icon}</div>
              <h3 className="wizard-title">{step.title}</h3>
              <p className="wizard-text">{step.body}</p>
              {step.github && (
                <div className="wizard-gh-mock">
                  <div className="wgm-topbar">
                    <div className="wgm-avatar" />
                    <span className="wgm-reponame">usuario / <strong>proyecto</strong></span>
                  </div>
                  <div className="wgm-bar">
                    <div className="wgm-files"><span>main.jsx</span><span>package.json</span><span>README.md</span></div>
                    <div className="wgm-code-btn">↓ Code</div>
                  </div>
                  <div className="wgm-popup">
                    <div className="wgm-tabs">
                      <span className="wgm-tab-active">HTTPS</span>
                      <span className="wgm-tab">SSH</span>
                      <span className="wgm-tab">CLI</span>
                    </div>
                    <div className="wgm-url-row">
                      <span>https://github.com/usuario/proyecto</span>
                      <div className="wgm-copy-icon">⎘</div>
                    </div>
                    <p className="wgm-caption">{lang === "es" ? "← copia esta URL" : "← copy this URL"}</p>
                  </div>
                </div>
              )}
              {step.hint && <p className="wizard-hint">{step.hint}</p>}
            </div>
            <div className="wizard-footer">
              <span className="wizard-step-counter">{wizardStep + 1} / {total}</span>
              <div className="wizard-nav">
                {wizardStep > 0 && (
                  <button className="wizard-btn wizard-btn-sec" onClick={() => setWizardStep((s) => s - 1)}>
                    {lang === "es" ? "← Anterior" : "← Back"}
                  </button>
                )}
                {wizardStep < total - 1 ? (
                  <button className="wizard-btn wizard-btn-pri" onClick={() => setWizardStep((s) => s + 1)}>
                    {lang === "es" ? "Siguiente →" : "Next →"}
                  </button>
                ) : (
                  <button className="wizard-btn wizard-btn-pri" onClick={closeWizard}>
                    {lang === "es" ? "Empezar →" : "Get started →"}
                  </button>
                )}
              </div>
            </div>
          </>
        );

        if (wizardRect) {
          const popoverWidth = 340;
          const gap = 14;
          const side = step.side || "below";
          let left, top;
          if (side === "left") {
            left = Math.max(12, wizardRect.left - gap - popoverWidth);
            top = Math.max(12, Math.min(wizardRect.top, window.innerHeight - 300 - 12));
          } else if (side === "right") {
            left = Math.min(wizardRect.right + gap, window.innerWidth - popoverWidth - 12);
            top = Math.max(12, Math.min(wizardRect.top, window.innerHeight - 300 - 12));
          } else {
            const spaceBelow = window.innerHeight - wizardRect.bottom;
            const above = spaceBelow < 260 + gap;
            left = Math.max(12, Math.min(wizardRect.left + wizardRect.width / 2 - popoverWidth / 2, window.innerWidth - popoverWidth - 12));
            top = above ? wizardRect.top - gap - 280 : wizardRect.bottom + gap;
          }
          return (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "transparent" }} onClick={closeWizard} />
              <div className="wizard-spotlight" style={{ left: wizardRect.left - 6, top: wizardRect.top - 6, width: wizardRect.width + 12, height: wizardRect.height + 12 }} />
              <div className="wizard-modal wizard-positioned" role="dialog" aria-modal="true" style={{ position: "fixed", left, top, width: popoverWidth, zIndex: 202 }}>
                {modalContent}
              </div>
            </>
          );
        }

        return (
          <div className="wizard-overlay" onClick={(e) => e.target === e.currentTarget && closeWizard()}>
            <div className="wizard-modal" role="dialog" aria-modal="true">
              {modalContent}
            </div>
          </div>
        );
      })()}

      {tokenModalOpen && (
        <div className="wizard-overlay" onClick={(e) => e.target === e.currentTarget && setTokenModalOpen(false)}>
          <div className="wizard-modal token-modal" style={{ maxWidth: "420px" }}>
            <button className="wizard-close" onClick={() => setTokenModalOpen(false)}>×</button>
            <div className="wizard-body">
              <div className="wizard-icon" style={{ display: "flex", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="wizard-title" style={{ marginTop: "12px", fontSize: "16px", fontWeight: "700", color: "#000000" }}>
                {lang === "es" ? "Introduce tu token de acceso" : "Enter your access token"}
              </h3>
              <p className="wizard-text" style={{ fontSize: "11px", color: "var(--text-sub)", margin: "8px 0 16px", lineHeight: "1.5" }}>
                {lang === "es" 
                  ? "Este repositorio es privado y necesitas introducir tu token de acceso personal para que GitHub pueda clonarlo y analizarlo." 
                  : "This repository is private and you need to enter your personal access token so GitHub can clone and analyze it."}
              </p>
              
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", gap: "8px" }}>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showToken ? "text" : "password"}
                    className="modal-token-input"
                    value={modalToken}
                    onChange={(e) => setModalToken(e.target.value)}
                    placeholder="ghp_..."
                    spellCheck={false}
                    style={{ paddingRight: "36px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    aria-label={showToken ? (lang === "es" ? "Ocultar token" : "Hide token") : (lang === "es" ? "Mostrar token" : "Show token")}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#6b7280", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                  >
                    {showToken ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=dsmap-analyzer"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "11px", color: "var(--primary)", textDecoration: "underline" }}
                  >
                    {lang === "es" ? "¿Cómo obtener este token?" : "How to get this token?"}
                  </a>
                </div>
                <label className="save-token-label" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", cursor: "pointer", fontSize: "11px", color: "var(--text-sub)" }}>
                  <input
                    type="checkbox"
                    checked={saveToken}
                    onChange={(e) => setSaveToken(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span>
                    {lang === "es" ? "Guardar token localmente para futuras búsquedas" : "Save token locally for future searches"}
                  </span>
                </label>

                <div style={{ width: "100%", marginTop: "12px", padding: "10px 12px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <strong style={{ fontSize: "11px", color: "#1e40af" }}>
                      {lang === "es" ? "Garantía de Privacidad y Seguridad" : "Privacy & Security Guarantee"}
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "10px", color: "#1e3a8a", lineHeight: "1.45" }}>
                    {lang === "es"
                      ? "Esta aplicación NO almacena ni conserva ningún dato de repositorios, código fuente ni tokens en servidores externos ni bases de datos. Todo el análisis se ejecuta en memoria volátil de sesión única y tu token solo se utiliza localmente para autenticar las llamadas a la API de GitHub."
                      : "This application DOES NOT store or retain any repository data, source code, or tokens on external servers or databases. All analysis runs strictly in single-session volatile memory and your token is used locally only for GitHub API requests."}
                  </p>
                </div>
              </div>
              <div className="wizard-nav" style={{ marginTop: "24px", display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
                {gitToken && (
                  <button
                    className="repo-btn"
                    style={{ background: "#ffffff", color: "#dc2626", border: "1px solid #dc2626", padding: "8px 14px", marginRight: "auto", whiteSpace: "nowrap" }}
                    onClick={() => {
                      setGitToken("");
                      setModalToken("");
                      window.localStorage.removeItem("git-token");
                      setTokenModalOpen(false);
                    }}
                  >
                    {lang === "es" ? "Eliminar token" : "Delete token"}
                  </button>
                )}
                <button 
                  className="repo-btn"
                  style={{ padding: "8px 16px" }}
                  onClick={() => {
                    setGitToken(modalToken);
                    if (saveToken) {
                      window.localStorage.setItem("git-token", modalToken);
                    } else {
                      window.localStorage.removeItem("git-token");
                    }
                    setTokenModalOpen(false);
                    analyzeRepo(repoUrl, modalToken);
                  }}
                >
                  {lang === "es" ? "Analizar repo" : "Analyze repo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {docFullscreenOpen && selectedPath && (
        <div className="wizard-overlay doc-fullscreen-overlay" onClick={(e) => e.target === e.currentTarget && setDocFullscreenOpen(false)}>
          <div className="doc-fullscreen-modal" role="dialog" aria-modal="true">
            <div className="doc-fullscreen-header">
              <div className="doc-fullscreen-title">
                <span className="mockup-tag">{codeLanguage(selectedPath)}</span>
                <h2>{selectedPath.split("/").pop()}</h2>
                <small>{selectedPath}</small>
              </div>
              <div className="doc-fullscreen-actions">
                {selectedCode != null && (
                  <button
                    type="button"
                    className="repo-btn has-tooltip"
                    data-tooltip={lang === "es" ? "Descargar archivo" : "Download file"}
                    aria-label={lang === "es" ? "Descargar archivo" : "Download file"}
                    onClick={() => downloadSelectedFile(selectedPath.split("/").pop(), selectedCode)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#2563eb", color: "#fff", fontSize: "11px" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>{lang === "es" ? "Descargar" : "Download"}</span>
                  </button>
                )}
                <button className="wizard-close" onClick={() => setDocFullscreenOpen(false)} aria-label={lang === "es" ? "Cerrar" : "Close"}>×</button>
              </div>
            </div>
            <div className="doc-fullscreen-body">
              {selectedCode != null ? (
                <pre className="doc-fullscreen-code"><code>{selectedCode}</code></pre>
              ) : (
                <div className="code-unavailable">{lang === "es" ? "La vista previa no está disponible para este archivo binario o de gran tamaño." : "Preview is unavailable for this binary or large file."}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tooltip && <div className="global-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y, transform: tooltip.transform }}>{tooltip.label}</div>}

      <footer className="app-footer">
        <div className="app-footer-left">
          <span>{lang === "es" ? "Tu repositorio de código explicado en lenguaje de diseño" : "Your code repo explained in design language"}</span>
          <button className="wizard-trigger footer-wizard-trigger" onClick={() => { setWizardStep(0); setWizardOpen(true); }}>
            {lang === "es" ? "Cómo empezar" : "Getting started"}
          </button>
        </div>
        <span className="app-footer-credit">
          {lang === "es" ? "Hecho por" : "Made by"}: <a href="https://www.martaconde.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: "600" }}>Marta Conde</a> | {lang === "es" ? "Remix del proyecto de:" : "Remix of a project by:"} <a href="https://agentic-design-system-visualization.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: "600" }}>Cristian Morales</a>
        </span>
      </footer>
    </div>
  );
}
