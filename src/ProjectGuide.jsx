import { useEffect, useMemo, useRef, useState } from "react";

const PURPOSES = {
  src: ["Contiene el código fuente principal de la aplicación.", "Contains the application's main source code."],
  app: ["Organiza las pantallas, rutas y lógica de la aplicación.", "Organizes the application's screens, routes, and logic."],
  components: ["Agrupa piezas reutilizables de interfaz.", "Groups reusable interface building blocks."],
  packages: ["Separa los paquetes y módulos del repositorio.", "Separates the repository's packages and modules."],
  public: ["Guarda recursos estáticos que se publican directamente.", "Stores static assets served directly."],
  server: ["Contiene la API y la lógica que se ejecuta en el servidor.", "Contains the API and server-side logic."],
  docs: ["Reúne la documentación del proyecto.", "Collects project documentation."],
  test: ["Incluye pruebas que verifican el comportamiento del código.", "Contains tests that verify code behavior."],
  tests: ["Incluye pruebas que verifican el comportamiento del código.", "Contains tests that verify code behavior."],
  scripts: ["Automatiza tareas de desarrollo, compilación o mantenimiento.", "Automates development, build, or maintenance tasks."],
};

function folderPurpose(name, lang) {
  return (PURPOSES[name.toLowerCase()] || [
    `Agrupa los archivos relacionados con ${name}.`,
    `Groups files related to ${name}.`,
  ])[lang === "es" ? 0 : 1];
}

function selectSystemVoice(persona, lang) {
  const voices = window.speechSynthesis?.getVoices() || [];
  const locale = lang === "es" ? "es" : "en";
  const localVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(locale));
  const preferredNames = persona === "alex"
    ? (lang === "es" ? ["lucía", "lucia", "mónica", "monica", "paulina", "marisol", "helena", "laura"] : ["samantha", "victoria", "karen", "ava", "moira", "fiona", "tessa"])
    : (lang === "es" ? ["diego", "pablo", "enrique", "jorge"] : ["aaron", "daniel", "fred", "tom", "arthur", "alex"]);
  return preferredNames.map((name) => localVoices.find((voice) => voice.name.toLowerCase().includes(name))).find(Boolean)
    || localVoices[persona === "alex" ? 0 : Math.min(1, localVoices.length - 1)]
    || voices[0];
}

const LIBRARY_NAMES = {
  react: "React",
  vue: "Vue",
  "@angular/core": "Angular",
  svelte: "Svelte",
  next: "Next.js",
  tailwindcss: "Tailwind CSS",
  "@mui/material": "Material UI",
  "@chakra-ui/react": "Chakra UI",
  "styled-components": "styled-components",
  "@emotion/react": "Emotion",
  antd: "Ant Design",
  "@mantine/core": "Mantine",
  bootstrap: "Bootstrap",
  "class-variance-authority": "CVA",
  "framer-motion": "Motion",
  "lucide-react": "Lucide",
};

function libraryName(packageName) {
  if (packageName.startsWith("@radix-ui/")) return "Radix UI";
  if (packageName.startsWith("@storybook/")) return "Storybook";
  return LIBRARY_NAMES[packageName];
}

export default function ProjectGuide({ data, lang, selectedPath, open, onClose, onSelectPath, activeCategory, onSelectCategory }) {
  const popupRef = useRef(null);
  const [mode, setMode] = useState("overview");
  const [speaking, setSpeaking] = useState(false);
  const [persona, setPersona] = useState("alex");
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const [sectionQuery, setSectionQuery] = useState("");
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [guideHeight, setGuideHeight] = useState(() => Number(window.localStorage.getItem("repo-guide-height")) || 760);
  const [resizingHeight, setResizingHeight] = useState(null);
  const [resizingTop, setResizingTop] = useState(null);
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false);
  const autoSpeakRef = useRef(false);
  const stateRef = useRef({});
  const folders = useMemo(() => {
    const counts = new Map();
    for (const file of data.files || []) {
      const top = file.includes("/") ? file.split("/")[0] : lang === "es" ? "raíz" : "root";
      counts.set(top, (counts.get(top) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.files, lang]);

  const design = useMemo(() => {
    const files = data.files || [];
    const nodes = data.nodes || [];
    const componentFiles = new Set();
    const pageFiles = new Set();
    const tokenFiles = new Set();
    const styleFiles = new Set();
    const storyFiles = new Set();
    const patternFiles = new Set();
    const documentationFiles = new Set();
    const layoutFiles = new Set();
    const codeFile = /\.(jsx?|tsx?|vue|svelte|rb|erb|haml|html|php|py|go)$/i;

    files.forEach((file) => {
      if (/(^|\/)(components?|ui)\//i.test(file) && codeFile.test(file)) componentFiles.add(file);
      if (/(^|\/)(pages?|screens?|views?|routes?|app)\//i.test(file) && codeFile.test(file) && !/(layout|loading|error|not-found)\.(jsx?|tsx?|erb)$/i.test(file)) pageFiles.add(file);
      if (/(^|\/)(tokens?|variables?|theme|primitives?|semantic|foundations?)(\/|\.|-)/i.test(file)) tokenFiles.add(file);
      if (/\.(css|scss|sass|less|styl)$/i.test(file)) styleFiles.add(file);
      if (/\.(stories?|story)\.(jsx?|tsx?|mdx)$/i.test(file)) storyFiles.add(file);
      if (/(^|\/)(patterns?|recipes?|templates?)\//i.test(file) || /(^|\/)(pattern|recipe)[.-]/i.test(file)) patternFiles.add(file);
      if (/(^|\/)docs?\//i.test(file) || /(^|\/)(readme|contributing|architecture|guidelines?)\.(md|mdx)$/i.test(file)) documentationFiles.add(file);
      if (/(^|\/)(layouts?|shells?)\//i.test(file) || /(^|\/)(layout|shell|template)\.(jsx?|tsx?|vue|svelte|rb|erb|haml|html|php|py|go)$/i.test(file)) layoutFiles.add(file);
    });
    nodes.forEach((node) => {
      const nodeFiles = node.files || [];
      if (node.tag === "component" || ["components", "ui"].includes(node.layer)) nodeFiles.forEach((file) => componentFiles.add(file));
      if (node.tag === "page") nodeFiles.forEach((file) => pageFiles.add(file));
      if (node.tag === "tokens" || ["tokens", "foundation"].includes(node.layer)) nodeFiles.filter((file) => !/package\.json$/i.test(file)).forEach((file) => tokenFiles.add(file));
      if (node.tag === "story") nodeFiles.forEach((file) => storyFiles.add(file));
      if (node.tag === "pattern" || node.layer === "patterns") nodeFiles.forEach((file) => patternFiles.add(file));
      if (["doc", "documentation"].includes(node.tag) || node.layer === "docs") nodeFiles.forEach((file) => documentationFiles.add(file));
      if (["layout", "template"].includes(node.tag)) nodeFiles.forEach((file) => layoutFiles.add(file));
    });

    const readmeLibraries = {
      icons: [],
      components: [],
      tokens: []
    };

    const readmeEntry = Object.entries(data.fileContents || {}).find(([path]) => path.toLowerCase().endsWith("discovery.md")) || 
                        Object.entries(data.fileContents || {}).find(([path]) => path.toLowerCase().endsWith("readme.md"));
    if (readmeEntry) {
      const source = readmeEntry[1];
      const lowerSource = source.toLowerCase();

      if (lowerSource.includes("font awesome pro") || lowerSource.includes("fontawesome pro") || lowerSource.includes("fontawesome-pro")) {
        readmeLibraries.icons.push(lang === "es" ? "Font Awesome Pro (Pago)" : "Font Awesome Pro (Paid)");
      } else if (lowerSource.includes("font awesome") || lowerSource.includes("fontawesome") || lowerSource.includes("font-awesome")) {
        readmeLibraries.icons.push("Font Awesome");
      }
      if (lowerSource.includes("streamline icon") || lowerSource.includes("streamline-icon") || lowerSource.includes("streamlineicon")) {
        readmeLibraries.icons.push(lang === "es" ? "Streamline Icons (Pago)" : "Streamline Icons (Paid)");
      }
      if (lowerSource.includes("noun project") || lowerSource.includes("thenounproject")) {
        readmeLibraries.icons.push(lang === "es" ? "The Noun Project (Pago)" : "The Noun Project (Paid)");
      }
      if (lowerSource.includes("remix icon") || lowerSource.includes("remixicon") || lowerSource.includes("remix-icon")) {
        readmeLibraries.icons.push("Remix Icons");
      }
      if (lowerSource.includes("lucide")) {
        readmeLibraries.icons.push("Lucide Icons");
      }
      if (lowerSource.includes("heroicon")) {
        readmeLibraries.icons.push("Heroicons");
      }
      if (lowerSource.includes("feather icon") || lowerSource.includes("feather-icon") || lowerSource.includes("feathericon")) {
        readmeLibraries.icons.push("Feather Icons");
      }

      if (lowerSource.includes("tailwind ui")) {
        readmeLibraries.components.push(lang === "es" ? "Tailwind UI (Pago)" : "Tailwind UI (Paid)");
      }
      if (lowerSource.includes("kendo ui") || lowerSource.includes("kendoui")) {
        readmeLibraries.components.push(lang === "es" ? "Kendo UI (Pago)" : "Kendo UI (Paid)");
      }
      if (lowerSource.includes("syncfusion")) {
        readmeLibraries.components.push(lang === "es" ? "Syncfusion (Pago)" : "Syncfusion (Paid)");
      }
      if (lowerSource.includes("radix ui") || lowerSource.includes("radix-ui")) {
        readmeLibraries.components.push("Radix UI");
      }
      if (lowerSource.includes("material ui") || lowerSource.includes("mui") || lowerSource.includes("@mui")) {
        readmeLibraries.components.push("Material UI");
      }
      if (lowerSource.includes("chakra ui") || lowerSource.includes("chakra-ui")) {
        readmeLibraries.components.push("Chakra UI");
      }
      if (lowerSource.includes("shadcn")) {
        readmeLibraries.components.push("shadcn/ui");
      }
      if (lowerSource.includes("mantine")) {
        readmeLibraries.components.push("Mantine");
      }
      if (lowerSource.includes("ant design") || lowerSource.includes("antd")) {
        readmeLibraries.components.push("Ant Design");
      }

      if (lowerSource.includes("supernova")) {
        readmeLibraries.tokens.push(lang === "es" ? "Supernova (Pago)" : "Supernova (Paid)");
      }
      if (lowerSource.includes("knapsack")) {
        readmeLibraries.tokens.push(lang === "es" ? "Knapsack (Pago)" : "Knapsack (Paid)");
      }
      if (lowerSource.includes("zeroheight")) {
        readmeLibraries.tokens.push(lang === "es" ? "zeroheight (Pago)" : "zeroheight (Paid)");
      }
      if (lowerSource.includes("style dictionary") || lowerSource.includes("style-dictionary")) {
        readmeLibraries.tokens.push("Style Dictionary");
      }
      if (lowerSource.includes("tokens studio") || lowerSource.includes("tokens-studio")) {
        readmeLibraries.tokens.push("Tokens Studio");
      }
      if (lowerSource.includes("tailwind")) {
        readmeLibraries.tokens.push("Tailwind CSS");
      }
    }

    const packages = new Set();
    Object.entries(data.fileContents || {}).forEach(([path, source]) => {
      const lowerPath = path.toLowerCase();
      if (lowerPath.endsWith("readme.md")) return;

      if (/(^|\/)package\.json$/i.test(path)) {
        try {
          const manifest = JSON.parse(source);
          [manifest.dependencies, manifest.devDependencies, manifest.peerDependencies].forEach((group) => Object.keys(group || {}).forEach((name) => packages.add(name)));
        } catch { /* A partial package.json preview is ignored. */ }
      }
      if (lowerPath.endsWith("gemfile") || lowerPath.endsWith("gemfile.lock")) {
        const lowerSource = source.toLowerCase();
        if ((lowerSource.includes("remix") || lowerSource.includes("remixicon") || lowerSource.includes("remix-icon")) && !readmeLibraries.icons.some(i => i.includes("Remix"))) {
          readmeLibraries.icons.push("Remix Icons");
        }
        if ((lowerSource.includes("font-awesome") || lowerSource.includes("fontawesome")) && !readmeLibraries.icons.some(i => i.includes("Font Awesome"))) {
          readmeLibraries.icons.push("Font Awesome");
        }
        if (lowerSource.includes("tailwind") && !readmeLibraries.tokens.some(t => t.includes("Tailwind"))) {
          readmeLibraries.tokens.push("Tailwind CSS");
        }
        if (lowerSource.includes("bootstrap") && !readmeLibraries.components.some(c => c.includes("Bootstrap"))) {
          readmeLibraries.components.push("Bootstrap");
        }
      }
    });

    const icons = [...readmeLibraries.icons];
    const tokens = [...readmeLibraries.tokens];
    const charts = [];
    const animations = [];
    const tables = [];
    const core = [];

    const getFriendlyName = (pkg) => {
      const PRESETS = {
        react: "React",
        vue: "Vue",
        "@angular/core": "Angular",
        svelte: "Svelte",
        next: "Next.js",
        nuxt: "Nuxt.js",
        tailwindcss: "Tailwind CSS",
        "@mui/material": "Material UI",
        "@chakra-ui/react": "Chakra UI",
        "styled-components": "styled-components",
        "@emotion/react": "Emotion",
        antd: "Ant Design",
        "@mantine/core": "Mantine",
        bootstrap: "Bootstrap",
        "class-variance-authority": "CVA",
        "framer-motion": "Motion",
        "lucide-react": "Lucide",
        "react-icons": "React Icons",
        "@heroicons/react": "Heroicons",
        "feather-icons": "Feather Icons",
        "@fortawesome/react-fontawesome": "FontAwesome",
        "style-dictionary": "Style Dictionary",
        "@tokens-studio/types": "Tokens Studio",
        recharts: "Recharts",
        "chart.js": "Chart.js",
        "react-chartjs-2": "React Chart.js",
        apexcharts: "ApexCharts",
        d3: "D3",
        "@tanstack/react-table": "TanStack Table",
        "react-table": "React Table",
        "react-virtual": "React Virtual",
        "@xyflow/react": "React Flow",
        "reactflow": "React Flow",
      };
      if (PRESETS[pkg]) return PRESETS[pkg];
      if (pkg.startsWith("@radix-ui/")) return "Radix UI";
      if (pkg.startsWith("@storybook/")) return "Storybook";
      return pkg.replace(/^@/, "").split("/").pop().replace(/-react$/, "").replace(/-js$/, "");
    };

    packages.forEach((pkg) => {
      const name = getFriendlyName(pkg);
      const lowerPkg = pkg.toLowerCase();
      if (lowerPkg.includes("icon") || lowerPkg === "lucide-react") {
        if (!icons.some(i => i.toLowerCase().includes(name.toLowerCase()))) {
          icons.push(name);
        }
      } else if (lowerPkg.includes("token") || lowerPkg === "style-dictionary") {
        if (!tokens.some(t => t.toLowerCase().includes(name.toLowerCase()))) {
          tokens.push(name);
        }
      } else if (lowerPkg.includes("chart") || lowerPkg === "d3" || lowerPkg === "apexcharts") {
        charts.push(name);
      } else if (lowerPkg === "framer-motion" || lowerPkg === "gsap" || lowerPkg === "animejs" || lowerPkg.includes("animate") || lowerPkg === "react-spring") {
        animations.push(name);
      } else if (lowerPkg.includes("table") || lowerPkg.includes("filter") || lowerPkg === "react-virtual") {
        tables.push(name);
      } else {
        const standard = LIBRARY_NAMES[pkg] || (pkg.startsWith("@radix-ui/") ? "Radix UI" : null) || (pkg.startsWith("@storybook/") ? "Storybook" : null) || pkg === "react" || pkg === "next";
        if (standard) {
          const finalName = standard === true ? getFriendlyName(pkg) : standard;
          if (!readmeLibraries.components.some(c => c.toLowerCase().includes(finalName.toLowerCase()))) {
            core.push(finalName);
          }
        }
      }
    });

    const finalIcons = icons.length ? [...new Set(icons)] : [];
    const finalTokens = tokens.length ? [...new Set(tokens)] : [];
    const finalComponents = readmeLibraries.components.length ? [...new Set(readmeLibraries.components)] : [];

    const hasDesignSystem = tokenFiles.size > 0 || storyFiles.size > 0 || componentFiles.size >= 3 || files.some((file) => /design-system|storybook/i.test(file));
    return { components: componentFiles.size, pages: pageFiles.size, tokens: tokenFiles.size, styles: styleFiles.size, stories: storyFiles.size, patterns: patternFiles.size, documentation: documentationFiles.size, layouts: layoutFiles.size, icons: finalIcons, tokensList: finalTokens, componentsList: finalComponents, charts, animations, tables, core, hasDesignSystem };
  }, [data.fileContents, data.files, data.nodes, lang]);
  const sectionOptions = useMemo(() => {
    const paths = new Set();
    (data.files || []).forEach((file) => {
      paths.add(file);
      const parts = file.split("/");
      parts.slice(0, -1).forEach((_, index) => paths.add(parts.slice(0, index + 1).join("/")));
    });
    const query = sectionQuery.trim().toLowerCase();
    return [...paths].filter((path) => !query || path.toLowerCase().includes(query)).sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b)).slice(0, 60);
  }, [data.files, sectionQuery]);

  const text = useMemo(() => {
    if (mode === "section" && selectedPath) {
      const matches = data.nodes.filter((node) => node.files?.some((file) => file === selectedPath || file.startsWith(selectedPath + "/")));
      if (lang === "es") return `${selectedPath} contiene ${matches.length || "varios"} elementos visuales relacionados. ${matches.map((node) => `${node.title}: ${node.what}`).join(" ") || "Selecciona un archivo relacionado para ver su tarjeta en el mapa."}`;
      return `${selectedPath} contains ${matches.length || "several"} related visual elements. ${matches.map((node) => `${node.title}: ${node.what_en || node.what}`).join(" ") || "Select a related file to see its card on the map."}`;
    }
    const allLibs = [...new Set([
      ...design.core,
      ...(design.icons[0]?.includes("custom") || design.icons[0]?.includes("Custom") ? [] : design.icons),
      ...(design.tokensList[0]?.includes("custom") || design.tokensList[0]?.includes("Custom") ? [] : design.tokensList),
      ...design.animations,
      ...design.charts,
      ...design.tables
    ])];
    const libraryText = allLibs.length ? allLibs.join(", ") : null;
    if (lang === "es") return `${design.hasDesignSystem ? "Sí veo una base de sistema de diseño" : "No veo un sistema de diseño formal, pero sí una base visual"} en ${data.repoName}. He encontrado ${design.components} componentes reutilizables, ${design.tokens} archivos de tokens, ${design.styles} archivos de estilos, ${design.patterns} patrones, ${design.layouts} layouts y ${design.pages} páginas de producto. También hay ${design.documentation} archivos de documentación.${libraryText ? ` Las librerías que afectan a la interfaz son ${libraryText}.` : " No he podido confirmar una librería visual desde los package.json analizados."} Los tokens guardan decisiones como color, tipografía y espacio. Los componentes aplican esas decisiones. Los patrones explican cómo combinar componentes para resolver acciones repetidas. Los layouts organizan las zonas comunes de una pantalla, y las páginas usan layouts, patrones y componentes para construir experiencias completas. La documentación explica cómo usar todo de forma consistente.${design.stories ? ` Además, hay ${design.stories} historias que enseñan estados y variantes.` : " No he detectado historias de componentes, así que sus estados pueden estar documentados en otro lugar."}`;
    return `${design.hasDesignSystem ? "I found a design-system foundation" : "I did not find a formal design system, but I did find a visual foundation"} in ${data.repoName}. It contains ${design.components} reusable components, ${design.tokens} token files, ${design.styles} style files, ${design.patterns} patterns, ${design.layouts} layouts, and ${design.pages} product pages. It also has ${design.documentation} documentation files.${libraryText ? ` The libraries that affect the interface are ${libraryText}.` : " I could not confirm a visual library from the analyzed package.json files."} Tokens store decisions such as color, type, and spacing. Components apply those decisions. Patterns explain how components are combined to solve repeated interactions. Layouts organize the shared areas of a screen, and pages use layouts, patterns, and components to build complete experiences. Documentation explains how to use everything consistently.${design.stories ? ` There are also ${design.stories} stories showing states and variants.` : " I did not detect component stories, so their states may be documented elsewhere."}`;
  }, [data, design, folders, lang, mode, selectedPath]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (event) => {
      const rect = popupRef.current?.getBoundingClientRect();
      const width = rect?.width || 390;
      const height = rect?.height || 400;
      setPosition({
        x: Math.max(8, Math.min(event.clientX - dragging.offsetX, window.innerWidth - width - 8)),
        y: Math.max(80, Math.min(event.clientY - dragging.offsetY, window.innerHeight - height - 8)),
      });
    };
    const onUp = () => setDragging(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [dragging]);

  useEffect(() => {
    window.localStorage.setItem("repo-guide-height", String(guideHeight));
  }, [guideHeight]);

  useEffect(() => {
    if (!resizingHeight) return undefined;
    const onMove = (event) => {
      const rect = popupRef.current?.getBoundingClientRect();
      const maxHeight = Math.max(200, window.innerHeight - (rect?.top || 80) - 8);
      setGuideHeight(Math.max(200, Math.min(resizingHeight.startHeight + event.clientY - resizingHeight.startY, maxHeight)));
    };
    const onUp = () => setResizingHeight(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [resizingHeight]);

  useEffect(() => {
    if (!resizingTop) return undefined;
    const onMove = (event) => {
      const dy = event.clientY - resizingTop.startY;
      const maxAllowedTop = resizingTop.startTop + (resizingTop.startHeight - 200);
      const newTop = Math.max(80, Math.min(maxAllowedTop, resizingTop.startTop + dy));
      const newHeight = Math.max(200, resizingTop.startHeight - (newTop - resizingTop.startTop));
      setPosition({ x: resizingTop.startX, y: newTop });
      setGuideHeight(newHeight);
    };
    const onUp = () => setResizingTop(null);
    document.body.classList.add("is-resizing");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      document.body.classList.remove("is-resizing");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizingTop]);

  stateRef.current = { sectionOptions, selectedPath, mode, data, lang, persona };

  const goToSection = (path) => {
    const isFolder = !(data.files || []).includes(path);
    onSelectPath(path, isFolder);
    setMode("section");
  };

  const currentSectionIndex = sectionOptions.indexOf(selectedPath);
  const canGoPrev = mode === "section" && currentSectionIndex > 0;
  const canGoNext = mode === "section" && currentSectionIndex >= 0 && currentSectionIndex < sectionOptions.length - 1;

  const speakText = (textContent) => {
    if (!window.speechSynthesis) return;
    const { lang: l, persona: p } = stateRef.current;
    const utterance = new SpeechSynthesisUtterance(textContent);
    utterance.lang = l === "es" ? "es-ES" : "en-US";
    utterance.voice = selectSystemVoice(p, l) || null;
    utterance.rate = 0.96;
    utterance.onend = () => {
      setSpeaking(false);
      const { mode: m, sectionOptions: opts, selectedPath: cur, data: d } = stateRef.current;
      if (m === "section") {
        const idx = opts.indexOf(cur);
        if (idx >= 0 && idx < opts.length - 1) {
          autoSpeakRef.current = true;
          const nextPath = opts[idx + 1];
          const isFolder = !(d.files || []).includes(nextPath);
          onSelectPath(nextPath, isFolder);
        }
      }
    };
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  useEffect(() => {
    if (!autoSpeakRef.current || !text) return;
    autoSpeakRef.current = false;
    speakText(text);
  }, [selectedPath]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAudio = () => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      autoSpeakRef.current = false;
      setSpeaking(false);
      return;
    }
    speakText(text);
  };

  if (!open) return null;
  return (
    <section ref={popupRef} className={"guide-popup" + (dragging ? " dragging" : "") + (resizingHeight || resizingTop ? " resizing" : "")} style={{ height: guideHeight, ...(position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : {}) }} aria-label={lang === "es" ? "Guía del proyecto" : "Project guide"}>
      <div
        className="guide-top-resizer"
        onPointerDown={(event) => {
          event.preventDefault();
          const rect = popupRef.current.getBoundingClientRect();
          setResizingTop({ startY: event.clientY, startTop: rect.top, startHeight: rect.height, startX: rect.left });
        }}
      />
      <div className="guide-head" onPointerDown={(event) => { if (event.target.closest("button")) return; const rect = popupRef.current.getBoundingClientRect(); event.currentTarget.setPointerCapture?.(event.pointerId); setPosition({ x: rect.left, y: rect.top }); setDragging({ offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top }); }}>
        <div>
          <span className="pane-kicker">PROJECT GUIDE</span>
          <h2>{lang === "es" ? "¿Quieres que te guíe por tu proyecto?" : "Would you like a tour of your project?"}</h2>
        </div>
        <div className="guide-head-actions">
          <button className="guide-head-btn guide-close has-tooltip" data-tooltip={lang === "es" ? "Cerrar guía" : "Close guide"} onClick={onClose} aria-label={lang === "es" ? "Cerrar guía" : "Close guide"}>×</button>
        </div>
      </div>
      <div className="guide-controls">
        <button className={mode === "overview" ? "active" : ""} onClick={() => setMode("overview")}>{lang === "es" ? "Vista general" : "Overview"}</button>
        <div className="section-picker">
          <button className={mode === "section" ? "active" : ""} aria-expanded={sectionMenuOpen} onClick={() => { setMode("section"); setSectionMenuOpen((value) => !value); }}>{lang === "es" ? "Sección por sección" : "Section by section"}<span aria-hidden="true" className="dropdown-chevron" /></button>
          {sectionMenuOpen && <div className="section-menu">
            <input autoFocus type="search" value={sectionQuery} onChange={(event) => setSectionQuery(event.target.value)} placeholder={lang === "es" ? "Buscar una parte…" : "Search a section…"} aria-label={lang === "es" ? "Buscar una parte del repositorio" : "Search a repository section"} />
            <div>{sectionOptions.map((path) => <button key={path} className={selectedPath === path ? "selected" : ""} onClick={() => { const isFolder = !(data.files || []).includes(path); onSelectPath(path, isFolder); setMode("section"); setSectionMenuOpen(false); }}><span>{(data.files || []).includes(path) ? "▧" : "▰"}</span>{path}</button>)}</div>
          </div>}
        </div>
        <div className="audio-split">
          <button className={"audio-icon has-tooltip" + (speaking ? " active" : "")} aria-label={speaking ? (lang === "es" ? "Pausar lectura" : "Pause reading") : (lang === "es" ? `Escuchar con ${persona === "alex" ? "Alex" : "Sam"}` : `Listen with ${persona === "alex" ? "Alex" : "Sam"}`)} data-tooltip={speaking ? (lang === "es" ? "Pausar lectura" : "Pause reading") : (lang === "es" ? `Escuchar con ${persona === "alex" ? "Alex" : "Sam"}` : `Listen with ${persona === "alex" ? "Alex" : "Sam"}`)} onClick={toggleAudio}><span aria-hidden="true">{speaking ? "Ⅱ" : "◖))"}</span></button>
          <button className="voice-menu-toggle has-tooltip" aria-label={lang === "es" ? "Elegir voz" : "Choose voice"} data-tooltip={lang === "es" ? "Elegir voz" : "Choose voice"} aria-expanded={voiceMenuOpen} onClick={() => setVoiceMenuOpen((value) => !value)}><span aria-hidden="true" className="dropdown-chevron" /></button>
          {voiceMenuOpen && <div className="voice-menu" role="menu">
            {[
              ["alex", "Alex"],
              ["sam", "Sam"],
            ].map(([value, label]) => <button key={value} role="menuitemradio" aria-checked={persona === value} className={persona === value ? "selected" : ""} onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); setPersona(value); setVoiceMenuOpen(false); }}>{label}<span>{persona === value ? "✓" : ""}</span></button>)}
          </div>}
        </div>
      </div>
      <div className="guide-body">
        {mode === "overview" ? (
          <div className="design-overview">
            <div className="design-status">
              <strong>{design.hasDesignSystem ? (lang === "es" ? "Sistema de diseño detectado" : "Design system detected") : (lang === "es" ? "Base visual detectada" : "Visual foundation detected")}</strong>
              <p>{text}</p>
            </div>
            <div className="design-metrics">
              {[
                [design.components, lang === "es" ? "Componentes" : "Components", "components"],
                [design.patterns, lang === "es" ? "Patrones" : "Patterns", "patterns"],
                [design.layouts, "Layouts", "layouts"],
                [design.pages, lang === "es" ? "Páginas" : "Pages", "pages"],
                [design.tokens, "Tokens", "tokens"],
                [design.styles, lang === "es" ? "Estilos" : "Styles", "styles"],
                [design.documentation, lang === "es" ? "Documentación" : "Documentación", "documentation"],
                [design.stories, "Stories", "stories"]
              ].map(([value, label, category]) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    className={"metric-card" + (isActive ? " active" : "")}
                    onClick={() => onSelectCategory(isActive ? null : category)}
                  >
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
              <div className="design-libraries" style={{ display: "grid", gap: "8px", marginTop: "20px" }}>
                <span>{lang === "es" ? "Librerías de interfaz" : "Interface libraries"}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {design.icons && design.icons.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Iconos: " : "Icons: "}</strong>
                      {design.icons.join(", ")}
                    </p>
                  )}
                  {design.componentsList && design.componentsList.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Componentes: " : "Components: "}</strong>
                      {design.componentsList.join(", ")}
                    </p>
                  )}
                  {design.tokensList && design.tokensList.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Tokens: " : "Tokens: "}</strong>
                      {design.tokensList.join(", ")}
                    </p>
                  )}
                  {design.animations.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Animaciones: " : "Animations: "}</strong>
                      {design.animations.join(", ")}
                    </p>
                  )}
                  {design.charts.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Gráficos: " : "Charts: "}</strong>
                      {design.charts.join(", ")}
                    </p>
                  )}
                  {design.tables.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Tablas/Filtros: " : "Tables/Filters: "}</strong>
                      {design.tables.join(", ")}
                    </p>
                  )}
                  {design.core.length > 0 && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#48444f", lineHeight: "1.4" }}>
                      <strong>{lang === "es" ? "Otros/Frameworks: " : "Others/Frameworks: "}</strong>
                      {design.core.join(", ")}
                    </p>
                  )}
                  {(!design.icons?.length && !design.componentsList?.length && !design.tokensList?.length && !design.animations.length && !design.charts.length && !design.tables.length && !design.core.length) && (
                    <p style={{ display: "block", margin: 0, fontSize: "11px", color: "#6b7280", fontStyle: "italic" }}>
                      {lang === "es" ? "No se detectaron librerías externas." : "No external libraries detected."}
                    </p>
                  )}
                </div>
              </div>
             <h3 style={{ marginTop: "24px" }}>{lang === "es" ? "Estructura principal" : "Main structure"}</h3>
            <div className="folder-grid">
              {folders.slice(0, 12).map(([name, count]) => (
                <button key={name} className="folder-card" onClick={() => name !== "raíz" && name !== "root" && onSelectPath(name, true)}>
                  <span>▰ {name}</span><strong>{count}</strong><small>{folderPurpose(name, lang)}</small>
                </button>
              ))}
            </div>
            
             <div className="guide-callout" style={{ marginTop: "24px", padding: "12px 14px", background: "#f8fafc", borderLeft: "4px solid var(--primary)", borderRadius: "0 8px 8px 0", fontSize: "11px", lineHeight: "1.5", color: "var(--text-sub)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "14px", marginTop: "-1px" }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <strong>{lang === "es" ? "Aviso importante" : "Important Notice"}</strong>
                  <button 
                    onClick={() => setDisclaimerExpanded(prev => !prev)}
                    style={{ background: "transparent", border: 0, color: "var(--primary)", fontSize: "11px", cursor: "pointer", padding: "0 4px", textDecoration: "underline", fontFamily: "inherit" }}
                  >
                    {disclaimerExpanded ? (lang === "es" ? "Ver menos" : "Show less") : (lang === "es" ? "Ver más..." : "See more...")}
                  </button>
                </div>
                {disclaimerExpanded && (
                  <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "var(--text-sub)", lineHeight: "1.5" }}>
                    {lang === "es" ? (
                      <>
                        Puede ser que no se mencionen todos los componentes o detalles del design system y que cada proyecto es completamente distinto. Esta web está entrenada para leer y buscar sobre nomenclatura muy genérica; si un CDS usa una estructura fuera de la habitual o usa otra nomenclatura, seguramente cueste encontrarla. Además, esto sirve únicamente como punto de partida para entender tu sistema. Se recomienda siempre hacer una auditoría para poder entenderlo; esto es una navegación para darte un overview pero no una fuente de verdad única e infalible.
                      </>
                    ) : (
                      <>
                        Some components or design system details might not be mentioned, and every project is completely distinct. This tool is trained to search and read generic nomenclature; if a design system uses a custom structure or custom naming conventions, it may be harder to detect. Additionally, this serves only as a starting point to understand your system. Conducting a manual audit is always recommended to fully understand it; this view is meant to provide a quick navigation overview but not a single source of absolute truth.
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="guide-summary">{text}</p>
            <div className="section-hint">{selectedPath ? `↳ ${selectedPath}` : (lang === "es" ? "Selecciona una carpeta o archivo en el árbol." : "Select a folder or file in the tree.")}</div>
            {sectionOptions.length > 0 && (
              <div className="section-nav">
                <button className="section-nav-btn" disabled={!canGoPrev} onClick={() => goToSection(sectionOptions[currentSectionIndex - 1])} aria-label={lang === "es" ? "Sección anterior" : "Previous section"}>← {lang === "es" ? "Anterior" : "Previous"}</button>
                {currentSectionIndex >= 0 && <span className="section-nav-count">{currentSectionIndex + 1} / {sectionOptions.length}</span>}
                <button className="section-nav-btn" disabled={!canGoNext} onClick={() => goToSection(sectionOptions[currentSectionIndex + 1])} aria-label={lang === "es" ? "Siguiente sección" : "Next section"}>{lang === "es" ? "Siguiente" : "Next"} →</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
