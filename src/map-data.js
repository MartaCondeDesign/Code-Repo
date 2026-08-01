export const LAYERS = [
  {
    id: "orchestration",
    label: "Orchestration Layer",
    sub: "AI instructions, rules & skills",
    color: "#a78bfa",
  },
  {
    id: "intent",
    label: "Intent Layer",
    sub: "Component logic & metadata — code as source of truth",
    color: "#34d399",
  },
  {
    id: "tokenization",
    label: "Tokenization Layer",
    sub: "Values and definitions — start building or auditing here",
    color: "#fbbf24",
  },
  {
    id: "indexing",
    label: "Indexing Layer",
    sub: "Mapping relationships — Storybook as index",
    color: "#38bdf8",
  },
  {
    id: "figma",
    label: "Figma Integration",
    sub: "Code ↔ design parity through persistent keys",
    color: "#f472b6",
  },
  {
    id: "loop",
    label: "Agentic Loop",
    sub: "The system can audit, report and heal itself",
    color: "#fb7185",
  },
];

export const NODES_DATA = [
  // Orchestration
  {
    id: "agents-md",
    layer: "orchestration",
    title: "AGENTS.md",
    sub: "rules · source of truth",
    tag: "rule",
    files: ["AGENTS.md"],
    what: "Documento de instrucciones del proyecto en la raíz del repo. Contiene el flujo de trabajo de Figma, la fuente de verdad de variantes/props (Storybook 6007) y las reglas de reuso de iconos y componentes.",
    does: "Define la fuente de verdad (Storybook 6007), las reglas de reuso de iconos/componentes en Figma y los comandos del figma-cli para cualquier agente que trabaje aquí. Es la primera lectura obligatoria.",
  },
  {
    id: "skill-component",
    layer: "orchestration",
    title: "propel-figma-component",
    sub: ".claude/skills · build workflow",
    tag: "skill",
    files: [".claude/skills/propel-figma-component/SKILL.md"],
    what: "Skill de Claude con el workflow completo para crear/actualizar un componente Propel en Figma. Incluye el patrón obligatorio de card (header + grid de variantes), la plantilla de descripción y las reglas globales.",
    does: "Impone las reglas globales (capas = código, reuso de iconos, variantes completas, nunca recortar texto) y genera la card con header, grid de variantes y descripción.",
  },
  {
    id: "skill-icons",
    layer: "orchestration",
    title: "propel-figma-icons",
    sub: ".claude/skills · 72 icons",
    tag: "skill",
    files: [".claude/skills/propel-figma-icons/SKILL.md"],
    what: "Skill de Claude para crear/actualizar la página Icons en Figma (los 72 iconos de Plane). Documenta el proceso de extracción de SVGs desde la fuente y la generación por lotes.",
    does: "Extrae los SVGs desde plane/packages/propel/src/icons, genera scripts por categoría y construye los iconos como COMPONENT 24×24 con vectores directos.",
  },
  {
    id: "philosophy",
    layer: "orchestration",
    title: "design-system-philosophy",
    sub: "canvas · surface · layer",
    tag: "doc",
    files: ["design-system-philosophy.md", "design.md"],
    what: "Documento con la filosofía de uso de Canvas, Surface y Layer en Plane. Explica cómo se usan los tokens de fondo (bg-canvas, bg-surface-*, bg-layer-*) y las reglas de jerarquía visual.",
    does: "Guía cómo aplicar tokens de fondo sin romper la jerarquía: canvas solo en la raíz, superficies como hermanos, capas anidadas dentro de superficies, y la jerarquía de texto (primary/secondary/tertiary).",
  },

  // Intent
  {
    id: "propel-src",
    layer: "intent",
    title: "plane/packages/propel/src",
    sub: "CVA variants + props type",
    tag: "code",
    files: ["plane/packages/propel/src/<name>/index.ts", "…/<name>.tsx", "…/<name>.stories.tsx"],
    what: "Código fuente real del design system Propel de Plane. Cada componente tiene su carpeta con el componente (TSX), la configuración de variantes (CVA) y los tipos de props.",
    does: "Es la fuente de verdad técnica: de aquí se derivan las variantes (CVA variants) y las props (props type) que se replican en Figma.",
  },
  {
    id: "stories",
    layer: "intent",
    title: ".stories.tsx",
    sub: "argTypes → full variants/props",
    tag: "code",
    files: ["plane/packages/propel/src/<name>/<name>.stories.tsx"],
    what: "Historias de Storybook por componente (argTypes + Default export). Cada historia muestra los controles y variantes visibles del componente.",
    does: "Define la lista completa de variantes y props visibles; el default story en :6007 es la fuente de verdad para no dejar variantes incompletas.",
  },
  {
    id: "audit",
    layer: "intent",
    title: "COMPONENTS_AUDIT.md",
    sub: "26 components · variant grids",
    tag: "doc",
    files: ["COMPONENTS_AUDIT.md"],
    what: "Inventario de los componentes de Propel con su estado en Figma, enlaces de Storybook y las props clave por componente.",
    does: "Sigue el progreso (existe/pendiente), documenta los grids de variantes por componente y los enlaces de Storybook.",
  },

  // Tokenization
  {
    id: "variables-css",
    layer: "tokenization",
    title: "variables.css",
    sub: "tailwind-config · oklch → hex",
    tag: "token",
    files: ["plane/packages/tailwind-config/variables.css"],
    what: "Hoja de tokens de Plane con los valores de color, tipografía y spacing en formato oklch.",
    does: "Contiene los valores (oklch) de colores, tipografía y spacing; se convierten a hex para importarlos a Figma Variables.",
  },
  {
    id: "figma-variables",
    layer: "tokenization",
    title: "Figma Variables",
    sub: "primitives + semantic",
    tag: "token",
    files: ["automation/scripts/import-plane-primitives.js", "…/import-plane-semantic-text.js"],
    what: "Variables de color/tipografía creadas en Figma, tanto primitivas como semánticas.",
    does: "Primitivas y semánticas se importan con scripts para que los componentes usen tokens reales, no hex sueltos.",
  },
  {
    id: "text-tokens",
    layer: "tokenization",
    title: "text tokens",
    sub: "text-size · tracking · scrollbar",
    tag: "token",
    files: ["automation/scripts/recreate-text-size-variables-a.js", "…/fix-tracking-variables.js", "…/create-missing-scrollbar-variables.js"],
    what: "Tokens de tipografía y UI menores (text-size, tracking, scrollbar, priority) que se reconciliaron en Figma.",
    does: "Se reconciliaron/recrearon en Figma para que texto y scrollbars usen las variables correctas y no queden con valores sueltos.",
  },

  // Indexing
  {
    id: "storybook",
    layer: "indexing",
    title: "Storybook stories",
    sub: ":6007 · variant source of truth",
    tag: "index",
    what: "Storybook de Propel corriendo en localhost:6007.",
    does: "El default story de cada componente muestra todas sus variantes y props; es la referencia para completar los sets en Figma.",
  },
  {
    id: "sb6007",
    layer: "indexing",
    title: "sb6007.json",
    sub: "index · 418 stories",
    tag: "index",
    what: "Índice JSON con las 418 stories de Storybook.",
    does: "Permite buscar y auditar componentes programáticamente sin abrir el navegador.",
  },
  {
    id: "icons-page",
    layer: "indexing",
    title: "Icons page",
    sub: "72 icon COMPONENTS · no Frame",
    tag: "index",
    what: "Página Icons en Figma con los 72 iconos de Plane como COMPONENT 24×24.",
    does: "Se reusan como instancias en los componentes (nunca se redibujan); los vectores van directos, sin Frame intermedio.",
  },
  {
    id: "maps",
    layer: "indexing",
    title: "maps/*.json",
    sub: "components · tokens",
    tag: "index",
    what: "Maps JSON que relacionan componentes y tokens.",
    does: "Indexan la correspondencia entre código, tokens y Figma para auditorías y sync.",
  },

  // Figma
  {
    id: "figma-cli",
    layer: "figma",
    title: "figma-cli daemon",
    sub: "port 3456 · FigCli plugin",
    tag: "tool",
    what: "CLI + plugin FigCli (Safe Mode) que habla con Figma a través de un daemon en el puerto 3456.",
    does: "Permite ejecutar scripts (eval -f, find, render-batch) que crean/editan componentes y variables en el archivo de Figma.",
  },
  {
    id: "automation",
    layer: "figma",
    title: "automation/scripts",
    sub: "build-*-card · reorganize · audit",
    tag: "tool",
    what: "Carpeta con los scripts Node que automatizan la construcción de cards, reorganización y auditorías.",
    does: "Construye cada card de componente (build-*-card.js), reordena el grid (reorganize) y verifica clipping/huérfanos/instancias.",
  },
  {
    id: "components-page",
    layer: "figma",
    title: "Components page",
    sub: "26 cards · variant sets",
    tag: "asset",
    what: "Página Components en Figma con 26 cards, cada una con su header, grid de variantes y descripción.",
    does: "Es el catálogo visual del design system: cada card envuelve un COMPONENT_SET con todas las variantes del componente.",
  },
  {
    id: "foundations",
    layer: "figma",
    title: "00_Foundations",
    sub: "base page",
    tag: "asset",
    what: "Página base de foundations en Figma.",
    does: "Contiene los cimientos del sistema (tokens, grids, estilos base) sobre los que se apoyan las páginas de componentes e iconos.",
  },

  // Agentic Loop
  {
    id: "audit-scripts",
    layer: "loop",
    title: "audit scripts",
    sub: "docs-links · casing · tokens",
    tag: "audit",
    what: "Scripts de auditoría (audit-component-documentation-links, property-casing, typography-variable-bindings).",
    does: "Detectan incoherencias: enlaces de documentación rotos, nombres de props mal formateados o variables de texto sin bindear.",
  },
  {
    id: "verification",
    layer: "loop",
    title: "visual verification",
    sub: "clipping · orphans · instances",
    tag: "audit",
    what: "Comprobación visual tras construir cada batch.",
    does: "Verifica que no hay texto recortado, nodos huérfanos ni iconos redibujados; confirma que las instancias quedaron correctas.",
  },
  {
    id: "self-healing",
    layer: "loop",
    title: "self-healing",
    sub: "global rules in skill + AGENTS.md",
    tag: "audit",
    what: "Reglas globales codificadas en la skill y en AGENTS.md.",
    does: "Convierte cada fallo detectado en una regla persistente para que no vuelva a ocurrir (los errores se curan ellos mismos en la siguiente iteración).",
  },
  {
    id: "arc",
    layer: "loop",
    title: "ARC",
    sub: "benchmark",
    tag: "audit",
    what: "Benchmark de arquitectura para evaluar la salud del design system.",
    does: "Mide qué tan completa y coherente está la infraestructura (código ↔ tokens ↔ Figma) y señala qué falta.",
  },
];

export const EDGES_DATA = [
  { id: "e1", source: "agents-md", target: "skill-component", verb: "enforces", color: "#a78bfa" },
  { id: "e2", source: "agents-md", target: "skill-icons", verb: "enforces", color: "#a78bfa" },
  { id: "e3", source: "skill-component", target: "propel-src", verb: "reads", color: "#a78bfa" },
  { id: "e4", source: "propel-src", target: "stories", verb: "generates", color: "#34d399" },
  { id: "e5", source: "stories", target: "audit", verb: "generates", color: "#34d399" },
  { id: "e6", source: "stories", target: "storybook", verb: "syncs-to", color: "#38bdf8" },
  { id: "e7", source: "storybook", target: "sb6007", verb: "generates", color: "#34d399" },
  { id: "e8", source: "variables-css", target: "figma-variables", verb: "imports", color: "#fbbf24" },
  { id: "e9", source: "figma-variables", target: "foundations", verb: "syncs-to", color: "#38bdf8" },
  { id: "e10", source: "propel-src", target: "icons-page", verb: "indexes", color: "#38bdf8" },
  { id: "e11", source: "icons-page", target: "components-page", verb: "reused-as", color: "#f472b6" },
  { id: "e12", source: "sb6007", target: "automation", verb: "feeds", color: "#38bdf8" },
  { id: "e13", source: "automation", target: "figma-cli", verb: "drives", color: "#f472b6" },
  { id: "e14", source: "figma-cli", target: "components-page", verb: "builds", color: "#f472b6" },
  { id: "e15", source: "figma-cli", target: "foundations", verb: "builds", color: "#f472b6" },
  { id: "e16", source: "components-page", target: "audit-scripts", verb: "audits", color: "#fb7185" },
  { id: "e17", source: "audit-scripts", target: "verification", verb: "reports", color: "#fb7185" },
  { id: "e18", source: "verification", target: "self-healing", verb: "heals", color: "#fb7185" },
  { id: "e19", source: "self-healing", target: "agents-md", verb: "heal", color: "#fb7185" },
  { id: "e20", source: "stories", target: "components-page", verb: "defines", color: "#34d399" },
];

export const VERB_DEFS = {
  enforces: "AGENTS.md obliga a los skills a seguir las reglas: es la fuente de verdad que todo agente lee primero.",
  reads: "La skill lee el código fuente real (CVA variants + props type) para derivar las variantes de cada componente.",
  generates: "El código y las stories de Storybook generan las variantes y el inventario que se replica en Figma.",
  "syncs-to": "Sincroniza los datos hacia el destino: Storybook exporta su índice y las variables se reflejan en Foundations.",
  imports: "Importa los tokens (variables.css, oklch→hex) a Figma Variables para que los componentes usen tokens reales.",
  indexes: "Indexa la relación en los maps JSON para auditar la correspondencia código ↔ tokens ↔ Figma.",
  "reused-as": "Los iconos se reusan como instancias (COMPONENT 24×24) dentro de los componentes; nunca se redibujan.",
  feeds: "El índice (sb6007.json) alimenta los scripts de automatización para auditar sin abrir el navegador.",
  drives: "Los scripts de automation/scripts manejan el figma-cli (daemon en :3456) para ejecutar eval/find/render-batch.",
  builds: "El figma-cli construye o actualiza las cards de componentes y las bases (Foundations) en el archivo de Figma.",
  audits: "Los scripts de auditoría revisan la página Components: enlaces de documentación, casing de props y tokens.",
  reports: "La verificación reporta las incoherencias detectadas (clipping, huérfanos, instancias) para su corrección.",
  heals: "El self-healing convierte cada fallo detectado en una regla persistente para que no vuelva a ocurrir.",
  heal: "El self-healing escribe las reglas aprendidas de vuelta en AGENTS.md: el sistema se cura solo en cada iteración.",
  defines: "Las stories de Storybook (argTypes + Default export) definen las variantes y props que se replican en Components.",
};

export const SUB_ES = {
  orchestration: "Instrucciones, reglas y skills de IA",
  intent: "Lógica y metadatos del componente — el código como fuente de verdad",
  tokenization: "Valores y definiciones — empieza a construir o auditar aquí",
  indexing: "Relaciones mapeadas — Storybook como índice",
  figma: "Paridad código ↔ diseño mediante claves persistentes",
  loop: "El sistema puede auditarse, informar y curarse solo",
  "agents-md": "reglas · fuente de verdad",
  "skill-component": ".claude/skills · workflow de build",
  "skill-icons": ".claude/skills · 72 iconos",
  "propel-src": "variantes CVA + tipo de props",
  stories: "argTypes → variantes/props completas",
  audit: "26 componentes · grids de variantes",
  "figma-variables": "primitivas + semánticas",
  storybook: ":6007 · fuente de verdad de variantes",
  sb6007: "índice · 418 stories",
  "icons-page": "72 iconos COMPONENT · sin Frame",
  maps: "componentes · tokens",
  "figma-cli": "puerto 3456 · plugin FigCli",
  "components-page": "26 cards · sets de variantes",
  foundations: "página base",
  verification: "recorte · huérfanos · instancias",
  "self-healing": "reglas globales en la skill + AGENTS.md",
};

export function subFor(item, lang) {
  if (!item) return "";
  if (Array.isArray(item.sub)) {
    return lang === "es" ? item.sub[0] : item.sub[1];
  }
  if (lang === "es") {
    if (SUB_ES[item.id]) return SUB_ES[item.id];
    return item.sub || "";
  }
  if (item.sub_en) return item.sub_en;
  return item.sub || "";
}

export const DESC_EN = {
  "agents-md": {
    what: "Project instruction document at the repo root. Contains the Figma workflow, the variant/prop source of truth (Storybook 6007) and the icon/component reuse rules.",
    does: "Defines the source of truth (Storybook 6007), the icon/component reuse rules in Figma and the figma-cli commands for any agent working here. It is the mandatory first read.",
  },
  "skill-component": {
    what: "Claude skill with the complete workflow to create/update a Propel component in Figma. Includes the mandatory card pattern (header + variant grid), the description template and the global rules.",
    does: "Enforces the global rules (layers = code, icon reuse, complete variants, never clip text) and generates the card with header, variant grid and description.",
  },
  "skill-icons": {
    what: "Claude skill to create/update the Icons page in Figma (Plane's 72 icons). Documents the SVG extraction process from source and batch generation.",
    does: "Extracts the SVGs from plane/packages/propel/src/icons, generates scripts by category and builds the icons as 24×24 COMPONENTs with direct vectors.",
  },
  philosophy: {
    what: "Document on the Canvas, Surface and Layer philosophy in Plane. Explains how background tokens (bg-canvas, bg-surface-*, bg-layer-*) are used and the visual hierarchy rules.",
    does: "Guides applying background tokens without breaking hierarchy: canvas only at the root, surfaces as siblings, layers nested inside surfaces, and the text hierarchy (primary/secondary/tertiary).",
  },
  "propel-src": {
    what: "Real source code of Plane's Propel design system. Each component has its folder with the component (TSX), the variant config (CVA) and the props types.",
    does: "It is the technical source of truth: the variants (CVA) and props (props type) replicated in Figma are derived from here.",
  },
  stories: {
    what: "Storybook stories per component (argTypes + Default export). Each story shows the visible controls and variants of the component.",
    does: "Defines the full list of visible variants and props; the default story on :6007 is the source of truth so no variant is left incomplete.",
  },
  audit: {
    what: "Inventory of Propel components with their status in Figma, Storybook links and the key props per component.",
    does: "Tracks progress (exists/pending), documents the variant grids per component and the Storybook links.",
  },
  "variables-css": {
    what: "Plane's token sheet with color, typography and spacing values in oklch format.",
    does: "Contains the (oklch) values for colors, typography and spacing; they are converted to hex to import them into Figma Variables.",
  },
  "figma-variables": {
    what: "Color/typography variables created in Figma, both primitive and semantic.",
    does: "Primitives and semantics are imported with scripts so components use real tokens, not loose hex values.",
  },
  "text-tokens": {
    what: "Typography and minor UI tokens (text-size, tracking, scrollbar, priority) reconciled in Figma.",
    does: "Reconciled/recreated in Figma so text and scrollbars use the correct variables instead of loose values.",
  },
  storybook: {
    what: "Propel's Storybook running on localhost:6007.",
    does: "The default story of each component shows all its variants and props; it is the reference to complete the sets in Figma.",
  },
  sb6007: {
    what: "JSON index with Storybook's 418 stories.",
    does: "Allows searching and auditing components programmatically without opening the browser.",
  },
  "icons-page": {
    what: "Icons page in Figma with Plane's 72 icons as 24×24 COMPONENTs.",
    does: "Reused as instances inside components (never redrawn); vectors go direct, with no intermediate Frame.",
  },
  maps: {
    what: "JSON maps relating components and tokens.",
    does: "Index the correspondence between code, tokens and Figma for audits and sync.",
  },
  "figma-cli": {
    what: "CLI + FigCli plugin (Safe Mode) that talks to Figma through a daemon on port 3456.",
    does: "Runs scripts (eval -f, find, render-batch) that create/edit components and variables in the Figma file.",
  },
  automation: {
    what: "Folder with the Node scripts that automate card building, reorganization and audits.",
    does: "Builds each component card (build-*-card.js), reorders the grid (reorganize) and verifies clipping/orphans/instances.",
  },
  "components-page": {
    what: "Components page in Figma with 26 cards, each with its header, variant grid and description.",
    does: "It is the visual catalog of the design system: each card wraps a COMPONENT_SET with all the component's variants.",
  },
  foundations: {
    what: "Base foundations page in Figma.",
    does: "Holds the system's foundations (tokens, grids, base styles) on top of which the component and icons pages sit.",
  },
  "audit-scripts": {
    what: "Audit scripts (audit-component-documentation-links, property-casing, typography-variable-bindings).",
    does: "Detect inconsistencies: broken documentation links, misformatted prop names or unbound text variables.",
  },
  verification: {
    what: "Visual check after building each batch.",
    does: "Verifies there's no clipped text, orphan nodes or redrawn icons; confirms the instances ended up correct.",
  },
  "self-healing": {
    what: "Global rules encoded in the skill and in AGENTS.md.",
    does: "Turns every detected failure into a persistent rule so it doesn't happen again (errors heal themselves on the next iteration).",
  },
  arc: {
    what: "Architecture benchmark to assess the design system's health.",
    does: "Measures how complete and coherent the infrastructure is (code ↔ tokens ↔ Figma) and points out what's missing.",
  },
};

export const VERB_DEFS_EN = {
  enforces: "AGENTS.md forces the skills to follow the rules: it is the source of truth every agent reads first.",
  reads: "The skill reads the real source code (CVA variants + props type) to derive each component's variants.",
  generates: "The code and Storybook stories generate the variants and the inventory replicated in Figma.",
  "syncs-to": "Syncs data towards the destination: Storybook exports its index and variables are mirrored into Foundations.",
  imports: "Imports the tokens (variables.css, oklch→hex) into Figma Variables so components use real tokens.",
  indexes: "Indexes the relationship in the JSON maps to audit the code ↔ tokens ↔ Figma correspondence.",
  "reused-as": "Icons are reused as instances (24×24 COMPONENT) inside components; never redrawn.",
  feeds: "The index (sb6007.json) feeds the automation scripts to audit without opening the browser.",
  drives: "automation/scripts drive the figma-cli (daemon on :3456) to run eval/find/render-batch.",
  builds: "The figma-cli builds or updates the component cards and bases (Foundations) in the Figma file.",
  audits: "Audit scripts review the Components page: documentation links, prop casing and tokens.",
  reports: "Verification reports the detected inconsistencies (clipping, orphans, instances) for correction.",
  heals: "Self-healing turns each detected failure into a persistent rule so it doesn't happen again.",
  heal: "Self-healing writes the learned rules back into AGENTS.md: the system heals itself on each iteration.",
  defines: "Storybook stories (argTypes + Default export) define the variants and props replicated in Components.",
};

export function whatFor(item, lang) {
  if (lang === "en") {
    if (DESC_EN[item.id]?.what) return DESC_EN[item.id].what;
    if (item.what_en) return item.what_en;
  }
  return item.what;
}

export function doesFor(item, lang) {
  if (lang === "en") {
    if (DESC_EN[item.id]?.does) return DESC_EN[item.id].does;
    if (item.does_en) return item.does_en;
  }
  return item.does;
}
