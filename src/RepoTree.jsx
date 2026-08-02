import { useEffect, useMemo, useRef, useState } from "react";

const CONCEPTS = {
  foundation: ["token", "theme", "style", "variable", "primitive", "semantic", "color", "typography", "spacing"],
  foundations: ["token", "theme", "style", "variable", "primitive", "semantic", "color", "typography", "spacing"],
  component: ["ui", "button", "card", "input", "modal", "form"],
  components: ["ui", "button", "card", "input", "modal", "form"],
  page: ["screen", "view", "route", "app"],
  pages: ["screen", "view", "route", "app"],
  documentation: ["docs", "readme", "guide", "architecture"],
  test: ["spec", "stories", "storybook", "e2e"],
};

function normalize(value = "") {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function makeTree(files) {
  const root = { name: "", path: "", children: new Map(), file: false };
  for (const filePath of files || []) {
    let cursor = root;
    const parts = filePath.split("/");
    parts.forEach((name, index) => {
      const currentPath = parts.slice(0, index + 1).join("/");
      if (!cursor.children.has(name)) {
        cursor.children.set(name, {
          name,
          path: currentPath,
          children: new Map(),
          file: index === parts.length - 1,
        });
      }
      cursor = cursor.children.get(name);
    });
  }
  return root;
}

function TreeRow({ item, depth, selectedPath, onSelect, defaultOpen, highlightedPaths }) {
  const [open, setOpen] = useState(defaultOpen ? depth < 1 : false);
  const rowRef = useRef(null);
  const isFolder = !item.file;
  const children = useMemo(() => {
    return [...item.children.values()].sort((a, b) => {
      if (a.file !== b.file) return a.file ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [item.children]);
  const active = selectedPath === item.path;

  useEffect(() => {
    if (isFolder && selectedPath?.startsWith(`${item.path}/`)) setOpen(true);
  }, [isFolder, item.path, selectedPath]);

  useEffect(() => {
    if (active) rowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <>
      <button
        ref={rowRef}
        className={"tree-row" + (active ? " active" : "") + (highlightedPaths?.has(item.path) ? " highlighted" : "")}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => {
          if (isFolder) setOpen((value) => !value);
          onSelect(item.path, isFolder);
        }}
        title={item.path}
      >
        <span className="tree-caret">{isFolder ? (open ? "⌄" : "›") : ""}</span>
        <span
          className={isFolder ? `tree-folder-icon${open ? " open" : ""}` : "tree-file-icon"}
          aria-hidden="true"
        />
        <span className="tree-label">{item.name}</span>
      </button>
      {isFolder && open && children.map((child) => (
        <TreeRow
          key={child.path}
          item={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          onSelect={onSelect}
          defaultOpen={defaultOpen}
          highlightedPaths={highlightedPaths}
        />
      ))}
    </>
  );
}

export default function RepoTree({ files, repoName, selectedPath, onSelect, lang, highlightedPaths }) {
  const [query, setQuery] = useState("");
  const tree = useMemo(() => makeTree(files), [files]);
  const children = useMemo(() => {
    return [...tree.children.values()].sort((a, b) => {
      if (a.file !== b.file) return a.file ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [tree.children]);
  
  const defaultOpen = (files?.length || 0) < 150;

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return null;
    const relatedTerms = CONCEPTS[term] || Object.entries(CONCEPTS).filter(([key]) => key.includes(term)).flatMap(([, values]) => values);
    const direct = [];
    const related = [];
    for (const path of files || []) {
      const normalizedPath = normalize(path);
      if (normalizedPath.includes(term)) direct.push(path);
      else if (relatedTerms.some((word) => normalizedPath.includes(word))) related.push(path);
    }
    return { direct, related };
  }, [files, query]);

  const MAX_SEARCH_RESULTS = 100;
  const visibleDirect = useMemo(() => results?.direct.slice(0, MAX_SEARCH_RESULTS) || [], [results]);
  const visibleRelated = useMemo(() => results?.related.slice(0, MAX_SEARCH_RESULTS) || [], [results]);
  const hasMoreDirect = (results?.direct.length || 0) > MAX_SEARCH_RESULTS;
  const hasMoreRelated = (results?.related.length || 0) > MAX_SEARCH_RESULTS;

  const SearchResult = ({ path, related = false }) => (
    <button className="tree-search-result" onClick={() => { onSelect(path, false); setQuery(""); }} title={path}>
      <span className="tree-file-icon" aria-hidden="true" />
      <span><strong>{path.split("/").pop()}</strong><small>{path}{related ? (lang === "es" ? " · concepto relacionado" : " · related concept") : ""}</small></span>
    </button>
  );

  return (
    <aside className="repo-tree" aria-label={lang === "es" ? "Árbol del repositorio" : "Repository tree"}>
      <div className="pane-heading">
        <div>
          <span className="pane-kicker">{lang === "es" ? "REPOSITORIO" : "REPOSITORY"}</span>
          <h2>{repoName || "project"}</h2>
        </div>
        <span
          className="file-count has-tooltip"
          tabIndex={0}
          data-tooltip={lang === "es" ? `${files?.length || 0} archivos en el árbol del repositorio` : `${files?.length || 0} files in the repository tree`}
          aria-label={lang === "es" ? `${files?.length || 0} archivos en el árbol del repositorio` : `${files?.length || 0} files in the repository tree`}
        >{files?.length || 0}</span>
      </div>
      <div className="tree-search-wrap">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={lang === "es" ? "Buscar archivo o concepto…" : "Search file or concept…"} aria-label={lang === "es" ? "Buscar en el repositorio" : "Search repository"} />
        {query && <button className="has-tooltip" data-tooltip={lang === "es" ? "Limpiar búsqueda" : "Clear search"} aria-label={lang === "es" ? "Limpiar búsqueda" : "Clear search"} onClick={() => setQuery("")}>×</button>}
      </div>
      <div className="tree-scroll">
        {results ? <div className="tree-results">
          <span className="tree-result-label">{lang === "es" ? "Coincide con el nombre" : "Name matches"}</span>
          {visibleDirect.map((path) => <SearchResult key={path} path={path} />)}
          {hasMoreDirect && <small className="tree-no-results">{lang === "es" ? `Mostrando los primeros ${MAX_SEARCH_RESULTS} resultados directos...` : `Showing first ${MAX_SEARCH_RESULTS} direct results...`}</small>}
          {!results.direct.length && <small className="tree-no-results">{lang === "es" ? "Ninguna coincidencia directa" : "No direct matches"}</small>}
          {!!results.related.length && <>
            <span className="tree-result-label related">{lang === "es" ? "Relacionado por concepto" : "Related by concept"}</span>
            {visibleRelated.map((path) => <SearchResult key={path} path={path} related />)}
            {hasMoreRelated && <small className="tree-no-results">{lang === "es" ? `Mostrando los primeros ${MAX_SEARCH_RESULTS} resultados relacionados...` : `Showing first ${MAX_SEARCH_RESULTS} related results...`}</small>}
          </>}
          {!results.direct.length && !results.related.length && <small className="tree-no-results">{lang === "es" ? "Prueba con otra palabra." : "Try another word."}</small>}
        </div> : children.map((item) => (
          <TreeRow key={item.path} item={item} depth={0} selectedPath={selectedPath} onSelect={onSelect} defaultOpen={defaultOpen} highlightedPaths={highlightedPaths} />
        ))}
      </div>
    </aside>
  );
}
