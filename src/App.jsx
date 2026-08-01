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

const DESIGN_REPOS = [
  { name: "shadcn/ui", detail: "Componentes abiertos para React", url: "https://github.com/shadcn-ui/ui" },
  { name: "Material UI", detail: "Sistema de componentes Material", url: "https://github.com/mui/material-ui" },
  { name: "Radix Primitives", detail: "Primitivas accesibles de interfaz", url: "https://github.com/radix-ui/primitives" },
  { name: "Chakra UI", detail: "Componentes React accesibles", url: "https://github.com/chakra-ui/chakra-ui" },
  { name: "Astryx", detail: "149 componentes de interfaz de producto", url: "https://github.com/facebook/astryx" },
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
      body: "El botón Guide abre un panel con el resumen completo del proyecto: qué es, cómo está organizado y qué hace cada parte — todo explicado en lenguaje de diseño.",
      target: ".repo-btn.guide-button",
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
      body: "The Guide button opens a panel with a full summary of the project: what it is, how it's organized, and what each part does — all explained in design language.",
      target: ".repo-btn.guide-button",
    },
  ],
};

function styledEdge(edge, active, dimmed, labelOffsetY = -14) {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "labeled",
    data: { color: edge.color, verb: edge.verb, dimmed, labelOffsetY },
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

export default function App() {
  const [map, setMap] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [lang, setLang] = useState("es");
  const [selected, setSelected] = useState(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [selectedIsFolder, setSelectedIsFolder] = useState(false);
  const [relatedIds, setRelatedIds] = useState(new Set());
  const [guideOpen, setGuideOpen] = useState(false);
  const [repoMenuOpen, setRepoMenuOpen] = useState(false);
  const [flow, setFlow] = useState(null);
  const [treeWidth, setTreeWidth] = useState(() => Number(window.localStorage.getItem("repo-tree-width")) || 360);
  const [resizingTree, setResizingTree] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(() => Number(window.localStorage.getItem("repo-inspector-width")) || 340);
  const [resizingInspector, setResizingInspector] = useState(false);
  const [explanationLevel, setExplanationLevel] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [readingMenuOpen, setReadingMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardRect, setWizardRect] = useState(null);
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
    setExplanationLevel(0);
  }, [selected?.id, selectedPath]);

  useLayoutEffect(() => {
    if (!wizardOpen) { setWizardRect(null); return; }
    const target = WIZARD_STEPS[lang][wizardStep]?.target;
    if (!target) { setWizardRect(null); return; }
    const el = document.querySelector(target);
    setWizardRect(el ? el.getBoundingClientRect() : null);
  }, [wizardOpen, wizardStep, lang]);

  useEffect(() => {
    const show = (event) => {
      const target = event.target.closest?.(".has-tooltip[data-tooltip]");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const label = target.dataset.tooltip;
      const width = Math.min(210, Math.max(70, label.length * 6.2 + 16));
      const above = rect.bottom + 48 > window.innerHeight;
      setTooltip({
        label,
        x: Math.max(8 + width / 2, Math.min(rect.left + rect.width / 2, window.innerWidth - 8 - width / 2)),
        y: above ? rect.top - 7 : rect.bottom + 7,
        above,
      });
    };
    const hide = (event) => {
      const target = event.target.closest?.(".has-tooltip[data-tooltip]");
      if (target && event.relatedTarget && target.contains(event.relatedTarget)) return;
      setTooltip(null);
    };
    document.addEventListener("mouseover", show);
    document.addEventListener("mouseout", hide);
    document.addEventListener("focusin", show);
    document.addEventListener("focusout", hide);
    return () => {
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

  const nodeMeta = useMemo(() => Object.fromEntries(data.nodes.map((node) => [node.id, node])), [data.nodes]);
  const hasFocus = relatedIds.size > 0;
  const nodes = useMemo(() => [
    ...lanes.map((lane) => ({
      id: `lane-${lane.id}`, type: "lane", position: { x: 0, y: lane.top }, width: lane.width, height: lane.height,
      data: { label: lane.label, sub: lane.sub, color: lane.color, width: lane.width, height: lane.height, layer: lane.id },
      selectable: false, draggable: false, zIndex: -1,
    })),
    ...layoutNodes.map((node) => {
      const layerColor = lanes.find((l) => l.id === node.data.layer)?.color || "#a78bfa";
      return {
        ...node,
        draggable: false,
        data: {
          ...node.data,
          color: layerColor,
          selected: relatedIds.has(node.id),
          dimmed: hasFocus && !relatedIds.has(node.id),
          what: nodeMeta[node.id]?.what || "",
          does: nodeMeta[node.id]?.does || "",
        },
      };
    }),
  ], [lanes, layoutNodes, relatedIds, hasFocus, nodeMeta]);

  const edges = useMemo(() => {
    const targetCounts = {};
    return data.edges.map((edge) => {
      const active = relatedIds.has(edge.source) || relatedIds.has(edge.target);
      const tgt = edge.target;
      targetCounts[tgt] = (targetCounts[tgt] || 0) + 1;
      const index = targetCounts[tgt] - 1;
      const labelOffsetY = -14 - index * 18; // offset label by 18px per overlapping edge
      return styledEdge(edge, active, false, labelOffsetY);
    });
  }, [data.edges, relatedIds, hasFocus]);

  const focusCard = useCallback((id) => {
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

  const analyzeRepo = async (urlOverride) => {
    const url = (typeof urlOverride === "string" ? urlOverride : repoUrl).trim();
    if (!url || busy) return;
    setRepoUrl(url);
    setRepoMenuOpen(false);
    setBusy(true);
    setErr(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Error");
      setBusy(false);
      startTransition(() => {
        setMap(result);
        setSelected(null);
        setSelectedPath("");
        setRelatedIds(new Set());
        setGuideOpen(true);
      });
      return;
    } catch (error) {
      setErr(error.message);
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
          <div className={"repo-input-wrap" + (map ? " has-reset" : "")}>
            <input className="repo-input" value={repoUrl} placeholder={t.repoPlaceholder} onChange={(event) => setRepoUrl(event.target.value)} onKeyDown={(event) => event.key === "Enter" && analyzeRepo()} spellCheck={false} />
            {map && <button className="reset-inside has-tooltip" onClick={resetMap} aria-label={t.resetTip} data-tooltip={t.resetTip}>↻</button>}
            <button className="repo-menu-toggle has-tooltip" aria-expanded={repoMenuOpen} aria-label={lang === "es" ? "Elegir un sistema de diseño abierto" : "Choose an open-source design system"} data-tooltip={lang === "es" ? "Elegir repositorio" : "Choose repository"} onClick={() => setRepoMenuOpen((value) => !value)}><span aria-hidden="true" className="dropdown-chevron" /></button>
            {repoMenuOpen && <div className="repo-menu">
              <span>{lang === "es" ? "Sistemas de diseño abiertos" : "Open-source design systems"}</span>
              {DESIGN_REPOS.map((repo) => <button key={repo.url} onClick={() => analyzeRepo(repo.url)}><strong>{repo.name}</strong><small>{repo.detail}</small></button>)}
            </div>}
          </div>
          <button className="repo-btn" onClick={analyzeRepo} aria-busy={busy}>{t.repoButton}</button>
          <button className="repo-btn guide-button" onClick={() => setGuideOpen(true)}>{t.guide}</button>
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
          <span className={lang === "es" ? "active" : ""}>ES</span>
          <button className="lang-toggle has-tooltip" role="switch" aria-checked={lang === "en"} aria-label={lang === "es" ? "Cambiar a inglés" : "Switch to Spanish"} data-tooltip={lang === "es" ? "Cambiar a inglés" : "Switch to Spanish"} onClick={() => setLang(lang === "es" ? "en" : "es")}><span className={"lang-knob" + (lang === "en" ? " right" : "")} /></button>
          <span className={lang === "en" ? "active" : ""}>EN</span>
        </div>
      </header>

      <main className={"workspace" + (selectedIsFile ? " code-open" : "")} style={{ "--tree-width": `${treeWidth}px`, "--inspector-width": `${inspectorWidth}px` }}>
        <RepoTree files={data.files || []} repoName={data.repoName} selectedPath={selectedPath} onSelect={selectPath} lang={lang} />
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
            {selectedPath && <button className="clear-focus" onClick={() => { setSelectedPath(""); setRelatedIds(new Set()); setSelected(null); }}>× {selectedPath}</button>}
          </div>
          <div className="graph">
            {busy && <div className="loading-overlay"><div className="scan-line" /><p>{t.repoAnalyzing}<br /><span className="loading-sub">{t.repoAnalyzingSub}</span></p></div>}
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodeClick={(_, node) => node.type === "chip" && focusCard(node.id)} onInit={setFlow} onPaneClick={() => { setRelatedIds(new Set()); setSelected(null); }} fitView fitViewOptions={{ padding: 0.12 }} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }} colorMode="light">
              <Background color="#d9d6e4" gap={24} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </section>

        {(selected || selectedIsFile || selectedIsFolder) && <div className="inspector-resizer" role="separator" aria-label={lang === "es" ? "Redimensionar panel derecho" : "Resize right panel"} aria-orientation="vertical" aria-valuemin="280" aria-valuemax="680" aria-valuenow={Math.round(inspectorWidth)} tabIndex={0} onPointerDown={(event) => { event.preventDefault(); setResizingInspector(true); }} onKeyDown={(event) => { if (event.key === "ArrowLeft") setInspectorWidth((width) => Math.min(680, width + 24)); if (event.key === "ArrowRight") setInspectorWidth((width) => Math.max(280, width - 24)); }}><span /></div>}
        {(selected || selectedIsFile || selectedIsFolder) && (
          <aside className={"inspector" + ((selectedIsFile || selectedIsFolder) ? " code-inspector" : "")}>
            <button className="icon-btn inspector-close has-tooltip" data-tooltip={lang === "es" ? "Cerrar panel" : "Close panel"} aria-label={lang === "es" ? "Cerrar panel" : "Close panel"} onClick={() => { setSelected(null); setSelectedPath(""); setSelectedIsFolder(false); setRelatedIds(new Set()); }}>×</button>
            {selectedIsFile ? (
              <>
                <span className="pane-kicker">{lang === "es" ? "ARCHIVO DE CÓDIGO" : "CODE FILE"}</span>
                <h2 className="code-file-name">{selectedPath.split("/").pop()}</h2>
                <p className="inspector-sub code-path">{selectedPath}</p>
                <div className="inspector-block">
                  <span>{lang === "es" ? "QUÉ ES" : "WHAT IT IS"}</span>
                  <p>{getFileExplanation(selectedPath, lang, selected, selectedCode)}</p>
                </div>
                <div className="code-shell">
                  <div className="code-toolbar"><span>{codeLanguage(selectedPath)}</span><span>{selectedCode == null ? "—" : `${selectedCode.split("\n").length} ${lang === "es" ? "líneas" : "lines"}`}</span></div>
                  {selectedCode != null ? <pre className="code-view"><code>{selectedCode}</code></pre> : <div className="code-unavailable">{lang === "es" ? "La vista previa no está disponible para este archivo binario o de gran tamaño." : "Preview is unavailable for this binary or large file."}</div>}
                </div>
                {selected && <div className="code-context"><span>{lang === "es" ? "RELACIONADO CON" : "RELATED TO"}</span><strong>{selected.title}</strong><p>{explanationLevel > 0 ? alternateExplanation(selected, lang, explanationLevel) : whatFor(selected, lang)}</p><ExplanationActions lang={lang} level={explanationLevel} onAlternate={() => setExplanationLevel((level) => Math.min(3, level + 1))} onReset={() => setExplanationLevel(0)} /></div>}
              </>
            ) : selectedIsFolder ? (
              <>
                <span className="pane-kicker">{lang === "es" ? "CARPETA DE PROYECTO" : "PROJECT FOLDER"}</span>
                <h2 className="code-file-name">{selectedPath.split("/").pop()}</h2>
                <p className="inspector-sub code-path">{selectedPath}</p>
                <div className="inspector-block">
                  <span>{lang === "es" ? "QUÉ ES" : "WHAT IT IS"}</span>
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

      <ProjectGuide data={data} lang={lang} selectedPath={selectedPath} open={guideOpen} onClose={() => setGuideOpen(false)} onSelectPath={selectPath} />

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
              <div className="wizard-dots">
                {WIZARD_STEPS[lang].map((_, i) => (
                  <button key={i} className={"wizard-dot" + (i === wizardStep ? " active" : "")} aria-label={`Paso ${i + 1}`} onClick={() => setWizardStep(i)} />
                ))}
              </div>
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
              <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)" }} onClick={closeWizard} />
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

      {tooltip && <div className={"global-tooltip" + (tooltip.above ? " above" : "")} role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.label}</div>}

      <footer className="app-footer">
        <div className="app-footer-left">
          <span>{lang === "es" ? "Tu repositorio de código explicado en lenguaje de diseño" : "Your code repo explained in design language"}</span>
          <button className="wizard-trigger footer-wizard-trigger" onClick={() => { setWizardStep(0); setWizardOpen(true); }}>
            {lang === "es" ? "Cómo empezar" : "Getting started"}
          </button>
        </div>
        <span className="app-footer-credit">{lang === "es" ? "Hecho por" : "Made by"} <strong>Marta Conde</strong> <span className="footer-divider" /> {lang === "es" ? "Remix del proyecto de" : "Remix of a project by"} <strong>Cristian Morales</strong> 💙</span>
      </footer>
    </div>
  );
}
