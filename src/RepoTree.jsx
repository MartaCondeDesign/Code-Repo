import { useEffect, useMemo, useRef, useState } from "react";


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
    const direct = (files || []).filter((p) => normalize(p).includes(term));
    return { direct, related: [] };
  }, [files, query]);

  const MAX_SEARCH_RESULTS = 100;
  const visibleDirect = useMemo(() => results?.direct.slice(0, MAX_SEARCH_RESULTS) || [], [results]);
  const hasMoreDirect = (results?.direct.length || 0) > MAX_SEARCH_RESULTS;

  const SearchResult = ({ path }) => (
    <button className="tree-search-result" onClick={() => { onSelect(path, false); setQuery(""); }} title={path}>
      <span className="tree-file-icon" aria-hidden="true" />
      <span><strong>{path.split("/").pop()}</strong><small>{path}</small></span>
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
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={lang === "es" ? "Buscar archivo…" : "Search file…"} aria-label={lang === "es" ? "Buscar en el repositorio" : "Search repository"} />
        {query && <button className="has-tooltip" data-tooltip={lang === "es" ? "Limpiar búsqueda" : "Clear search"} aria-label={lang === "es" ? "Limpiar búsqueda" : "Clear search"} onClick={() => setQuery("")}>×</button>}
      </div>
      <div className="tree-scroll">
        {results ? <div className="tree-results">
          {visibleDirect.map((path) => <SearchResult key={path} path={path} />)}
          {hasMoreDirect && <small className="tree-no-results">{lang === "es" ? `Mostrando los primeros ${MAX_SEARCH_RESULTS} resultados...` : `Showing first ${MAX_SEARCH_RESULTS} results...`}</small>}
          {!results.direct.length && (
            <div className="tree-empty-state">
              <div className="tree-empty-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
              <strong>{lang === "es" ? "Sin resultados" : "No results found"}</strong>
              <p>{lang === "es" ? "No encontramos archivos que coincidan con tu búsqueda." : "No matching files were found for your search."}</p>
            </div>
          )}
        </div> : children.map((item) => (
          <TreeRow key={item.path} item={item} depth={0} selectedPath={selectedPath} onSelect={onSelect} defaultOpen={defaultOpen} highlightedPaths={highlightedPaths} />
        ))}
      </div>
    </aside>
  );
}
