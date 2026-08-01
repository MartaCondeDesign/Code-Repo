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
    ? (lang === "es" ? ["monica", "mónica", "paulina", "marisol", "helena", "laura"] : ["samantha", "victoria", "karen", "ava", "moira", "fiona", "tessa"])
    : (lang === "es" ? ["jorge", "diego", "enrique", "pablo"] : ["daniel", "alex", "fred", "tom", "aaron", "arthur"]);
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

export default function ProjectGuide({ data, lang, selectedPath, open, onClose, onSelectPath }) {
  const popupRef = useRef(null);
  const [mode, setMode] = useState("overview");
  const [speaking, setSpeaking] = useState(false);
  const [persona, setPersona] = useState("alex");
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const [sectionQuery, setSectionQuery] = useState("");
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [guideHeight, setGuideHeight] = useState(() => Number(window.localStorage.getItem("repo-guide-height")) || 430);
  const [resizingHeight, setResizingHeight] = useState(null);
  const [resizingTop, setResizingTop] = useState(null);
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
    const codeFile = /\.(jsx?|tsx?|vue|svelte)$/i;

    files.forEach((file) => {
      if (/(^|\/)(components?|ui)\//i.test(file) && codeFile.test(file)) componentFiles.add(file);
      if (/(^|\/)(pages?|screens?|views?|routes?|app)\//i.test(file) && codeFile.test(file) && !/(layout|loading|error|not-found)\.(jsx?|tsx?)$/i.test(file)) pageFiles.add(file);
      if (/(^|\/)(tokens?|variables?|theme|primitives?|semantic|foundations?)(\/|\.|-)/i.test(file)) tokenFiles.add(file);
      if (/\.(css|scss|sass|less|styl)$/i.test(file)) styleFiles.add(file);
      if (/\.(stories?|story)\.(jsx?|tsx?|mdx)$/i.test(file)) storyFiles.add(file);
      if (/(^|\/)(patterns?|recipes?|templates?)\//i.test(file) || /(^|\/)(pattern|recipe)[.-]/i.test(file)) patternFiles.add(file);
      if (/(^|\/)docs?\//i.test(file) || /(^|\/)(readme|contributing|architecture|guidelines?)\.(md|mdx)$/i.test(file)) documentationFiles.add(file);
      if (/(^|\/)(layouts?|shells?)\//i.test(file) || /(^|\/)(layout|shell|template)\.(jsx?|tsx?|vue|svelte)$/i.test(file)) layoutFiles.add(file);
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

    const packages = new Set();
    Object.entries(data.fileContents || {}).forEach(([path, source]) => {
      if (!/(^|\/)package\.json$/i.test(path)) return;
      try {
        const manifest = JSON.parse(source);
        [manifest.dependencies, manifest.devDependencies, manifest.peerDependencies].forEach((group) => Object.keys(group || {}).forEach((name) => packages.add(name)));
      } catch { /* A partial package.json preview is ignored. */ }
    });
    const libraries = [...new Set([...packages].map(libraryName).filter(Boolean))];
    const hasDesignSystem = tokenFiles.size > 0 || storyFiles.size > 0 || componentFiles.size >= 3 || files.some((file) => /design-system|storybook/i.test(file));
    return { components: componentFiles.size, pages: pageFiles.size, tokens: tokenFiles.size, styles: styleFiles.size, stories: storyFiles.size, patterns: patternFiles.size, documentation: documentationFiles.size, layouts: layoutFiles.size, libraries, hasDesignSystem };
  }, [data.fileContents, data.files, data.nodes]);
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
    const libraryText = design.libraries.length ? design.libraries.join(", ") : null;
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
      const maxHeight = Math.max(300, window.innerHeight - (rect?.top || 80) - 8);
      setGuideHeight(Math.max(300, Math.min(resizingHeight.startHeight + event.clientY - resizingHeight.startY, maxHeight)));
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
      const newTop = Math.max(80, resizingTop.startTop + dy);
      const newHeight = Math.max(300, resizingTop.startHeight - (newTop - resizingTop.startTop));
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
              {[[design.components, lang === "es" ? "Componentes" : "Components"], [design.patterns, lang === "es" ? "Patrones" : "Patterns"], [design.layouts, "Layouts"], [design.pages, lang === "es" ? "Páginas" : "Pages"], [design.tokens, "Tokens"], [design.styles, lang === "es" ? "Estilos" : "Styles"], [design.documentation, lang === "es" ? "Documentación" : "Documentation"], [design.stories, "Stories"]].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
            <div className="design-libraries"><span>{lang === "es" ? "Librerías de interfaz" : "Interface libraries"}</span><div>{design.libraries.length ? design.libraries.map((library) => <small key={library}>{library}</small>) : <small>{lang === "es" ? "No detectadas" : "Not detected"}</small>}</div></div>
            <h3>{lang === "es" ? "Estructura principal" : "Main structure"}</h3>
            <div className="folder-grid">
              {folders.slice(0, 12).map(([name, count]) => (
                <button key={name} className="folder-card" onClick={() => name !== "raíz" && name !== "root" && onSelectPath(name, true)}>
                  <span>▰ {name}</span><strong>{count}</strong><small>{folderPurpose(name, lang)}</small>
                </button>
              ))}
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
