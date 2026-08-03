import { useEffect, useMemo, useRef, useState } from "react";


function normalize(value = "") {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function getExt(path) {
  const name = path.split("/").pop() || "";
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function fileKind(path) {
  const ext = getExt(path);
  if (ext === "svg") return "svg";
  if (["png", "jpg", "jpeg", "gif", "webp", "ico", "avif", "bmp"].includes(ext)) return "image";
  if (["md", "mdx", "txt", "rst"].includes(ext)) return "doc";
  if (["ts", "tsx", "js", "jsx", "mjs", "cjs", "vue", "svelte"].includes(ext)) return "code";
  if (["json", "yaml", "yml", "toml", "env"].includes(ext)) return "config";
  if (["css", "scss", "sass", "less"].includes(ext)) return "style";
  return "file";
}

function FileKindIcon({ path, size = 13 }) {
  const kind = fileKind(path);
  const s = { width: size, height: size, flexShrink: 0, display: "block" };
  if (kind === "svg") return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* cat face */}
      <circle cx="6.5" cy="7.5" r="3.8" stroke="#7c3aed" strokeWidth="1.1" fill="#ede9fe"/>
      {/* ears */}
      <polygon points="3.4,5.2 4.2,2.8 5.4,4.8" stroke="#7c3aed" strokeWidth="1" fill="#ede9fe" strokeLinejoin="round"/>
      <polygon points="7.6,4.8 8.8,2.8 9.6,5.2" stroke="#7c3aed" strokeWidth="1" fill="#ede9fe" strokeLinejoin="round"/>
      {/* eyes */}
      <circle cx="5.2" cy="7.3" r="0.65" fill="#7c3aed"/>
      <circle cx="7.8" cy="7.3" r="0.65" fill="#7c3aed"/>
      {/* nose */}
      <circle cx="6.5" cy="8.5" r="0.4" fill="#7c3aed"/>
      {/* whiskers */}
      <line x1="2.5" y1="8.2" x2="5.2" y2="8.6" stroke="#7c3aed" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="7.8" y1="8.6" x2="10.5" y2="8.2" stroke="#7c3aed" strokeWidth="0.7" strokeLinecap="round"/>
    </svg>
  );
  if (kind === "image") return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1.5" width="11" height="10" rx="2" stroke="#0891b2" strokeWidth="1.1" fill="#ecfeff"/>
      <circle cx="4.5" cy="5.2" r="1.1" stroke="#0891b2" strokeWidth="1" fill="none"/>
      <polyline points="2,11 5,7.5 7.5,9.5 9.5,6.5 12,9" stroke="#0891b2" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (kind === "doc") return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1" width="10" height="11" rx="1.5" stroke="#6b7280" strokeWidth="1.1" fill="#f9fafb"/>
      <line x1="3.5" y1="4.5" x2="9.5" y2="4.5" stroke="#6b7280" strokeWidth="1" strokeLinecap="round"/>
      <line x1="3.5" y1="6.5" x2="9.5" y2="6.5" stroke="#6b7280" strokeWidth="1" strokeLinecap="round"/>
      <line x1="3.5" y1="8.5" x2="7" y2="8.5" stroke="#6b7280" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
  if (kind === "code") return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1" width="10" height="11" rx="1.5" stroke="#2563eb" strokeWidth="1.1" fill="#eff6ff"/>
      <polyline points="4,4.5 2.5,6.5 4,8.5" stroke="#2563eb" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9,4.5 10.5,6.5 9,8.5" stroke="#2563eb" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="7" y1="3.5" x2="6" y2="9.5" stroke="#2563eb" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
  if (kind === "config") return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1" width="10" height="11" rx="1.5" stroke="#d97706" strokeWidth="1.1" fill="#fffbeb"/>
      <circle cx="6.5" cy="6.5" r="1.5" stroke="#d97706" strokeWidth="1" fill="none"/>
      <line x1="6.5" y1="3.5" x2="6.5" y2="4.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round"/>
      <line x1="6.5" y1="8.5" x2="6.5" y2="9.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round"/>
      <line x1="3.5" y1="6.5" x2="4.5" y2="6.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round"/>
      <line x1="8.5" y1="6.5" x2="9.5" y2="6.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
  if (kind === "style") return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1" width="10" height="11" rx="1.5" stroke="#db2777" strokeWidth="1.1" fill="#fdf2f8"/>
      <text x="6.5" y="8.5" textAnchor="middle" fontSize="6" fill="#db2777" fontWeight="700">#</text>
    </svg>
  );
  return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1" width="10" height="11" rx="1.5" stroke="#9ca3af" strokeWidth="1.1" fill="#f9fafb"/>
    </svg>
  );
}

function FolderIcon({ open, size = 13 }) {
  const s = { width: size, height: size, flexShrink: 0, display: "block" };
  return (
    <svg style={s} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={open
        ? "M1 4.5 C1 3.4 1.9 2.5 3 2.5 L5.5 2.5 L6.5 4 L11 4 C11.6 4 12 4.4 12 5 L12 10 C12 10.6 11.6 11 11 11 L2 11 C1.4 11 1 10.6 1 10 Z"
        : "M1 3.5 C1 2.9 1.4 2.5 2 2.5 L5.5 2.5 L6.5 4 L11 4 C11.6 4 12 4.4 12 5 L12 10 C12 10.6 11.6 11 11 11 L2 11 C1.4 11 1 10.6 1 10 Z"}
        stroke="#f59e0b" strokeWidth="1.1" fill={open ? "#fef3c7" : "#fffbeb"}/>
    </svg>
  );
}const FILTER_CATEGORIES = [
  {
    id: "folder",
    label: { es: "Carpetas", en: "Folders" },
    color: "#d97706",
    bg: "#fef3c7",
    exts: ["folder"],
  },
  {
    id: "style",
    label: { es: "Estilos", en: "Styles" },
    color: "#be185d",
    bg: "#fdf2f8",
    exts: ["css", "scss", "sass", "less", "styl"],
  },
  {
    id: "assets",
    label: { es: "Assets", en: "Assets" },
    color: "#7c3aed",
    bg: "#ede9fe",
    exts: ["svg", "png", "jpg", "jpeg", "gif", "webp", "ico", "avif"],
  },
  {
    id: "doc",
    label: { es: "Documentación", en: "Documentation" },
    color: "#374151",
    bg: "#f3f4f6",
    exts: ["md", "mdx", "txt", "pdf", "rst", "docx"],
  },
  {
    id: "template",
    label: { es: "Plantillas y UI", en: "Templates & UI" },
    color: "#065f46",
    bg: "#ecfdf5",
    exts: ["html", "vue", "svelte", "astro", "hbs", "ejs", "pug"],
  },
  {
    id: "code",
    label: { es: "Código", en: "Code" },
    color: "#1d4ed8",
    bg: "#eff6ff",
    exts: ["ts", "tsx", "js", "jsx", "mjs", "cjs", "py", "go", "rb", "java", "php", "swift", "kt"],
  },
  {
    id: "config",
    label: { es: "Configuración", en: "Config" },
    color: "#b45309",
    bg: "#fffbeb",
    exts: ["json", "yaml", "yml", "toml", "env", "lock", "ini"],
  },
];

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
    if (active) rowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  return (
    <>
      <button
        ref={rowRef}
        className={"tree-row has-tooltip" + (active ? " active" : "") + (highlightedPaths?.has(item.path) ? " highlighted" : "")}
        data-tooltip={item.path}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => {
          if (isFolder) setOpen((value) => !value);
          onSelect(item.path, isFolder);
        }}
      >
        <span className="tree-caret">{isFolder ? (open ? "⌄" : "›") : ""}</span>
        {isFolder
          ? <FolderIcon open={open} />
          : <FileKindIcon path={item.path} />}
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
  const [filterExt, setFilterExt] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [collapsed, setCollapsed] = useState(new Set());
  const searchAreaRef = useRef(null);

  const tree = useMemo(() => makeTree(files), [files]);
  const children = useMemo(() => {
    return [...tree.children.values()].sort((a, b) => {
      if (a.file !== b.file) return a.file ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [tree.children]);

  const defaultOpen = (files?.length || 0) < 150;

  const folderPaths = useMemo(() => {
    const set = new Set();
    (files || []).forEach(f => {
      const parts = f.split("/");
      for (let i = 1; i < parts.length; i++) set.add(parts.slice(0, i).join("/"));
    });
    return [...set].sort();
  }, [files]);

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e) => { if (!searchAreaRef.current?.contains(e.target)) setFilterOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    const hasQuery = Boolean(term);
    const hasFilter = Boolean(filterExt);
    if (!hasQuery && !hasFilter) return null;
    let matchedFiles = (files || []);
    let matchedFolders = [...folderPaths];
    if (hasQuery) {
      matchedFiles = matchedFiles.filter(p => normalize(p).includes(term));
      matchedFolders = folderPaths.filter(p => normalize(p.split("/").pop()).includes(term));
    }
    if (hasFilter) {
      if (filterExt === "folder") {
        matchedFiles = [];
      } else {
        matchedFiles = matchedFiles.filter(p => getExt(p) === filterExt);
        matchedFolders = [];
      }
    }
    return { files: matchedFiles, folders: matchedFolders };
  }, [files, folderPaths, query, filterExt]);

  const MAX_RESULTS = 80;
  const visibleFiles = results?.files.slice(0, MAX_RESULTS) || [];
  const visibleFolders = results?.folders.slice(0, 20) || [];
  const totalShown = visibleFiles.length + visibleFolders.length;
  const totalFound = (results?.files.length || 0) + (results?.folders.length || 0);

  const hasFilter = Boolean(filterExt);

  const applyExt = (ext) => {
    setFilterExt(prev => prev === ext ? "" : ext);
    setFilterOpen(false);
    setFilterSearch("");
  };

  const clearFilter = () => {
    setFilterExt("");
    setFilterSearch("");
    setFilterOpen(false);
  };

  const toggleCollapse = (id) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fsTerm = filterSearch.trim().toLowerCase().replace(/^\./, "");
  const filteredCats = useMemo(() => {
    if (!fsTerm) return FILTER_CATEGORIES;
    return FILTER_CATEGORIES.map(cat => ({
      ...cat,
      exts: cat.exts.filter(e => e.includes(fsTerm) || cat.label.es.toLowerCase().includes(fsTerm) || cat.label.en.toLowerCase().includes(fsTerm)),
    })).filter(cat => cat.exts.length > 0);
  }, [fsTerm]);

  const allKnownExts = useMemo(() => FILTER_CATEGORIES.flatMap(c => c.exts), []);
  const customNotInList = fsTerm && !allKnownExts.includes(fsTerm);
  const filterBadgeName = filterExt ? (filterExt === "folder" ? (lang === "es" ? "Carpetas" : "Folders") : `.${filterExt}`) : null;

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
          title={lang === "es" ? "Número total de archivos en el repositorio" : "Total number of files in the repository"}
          data-tooltip={lang === "es" ? "Número total de archivos en el repositorio" : "Total number of files in the repository"}
          aria-label={lang === "es" ? "Número total de archivos en el repositorio" : "Total number of files in the repository"}
        >{files?.length || 0}</span>
      </div>

      {/* Search area: wraps input row + dropdown so dropdown spans full width */}
      <div className="tree-search-area" ref={searchAreaRef}>
        <div className="tree-search-wrap">
          <span aria-hidden="true" style={{ display: "flex", alignItems: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder={lang === "es" ? "Buscar archivo…" : "Search file…"}
            aria-label={lang === "es" ? "Buscar en el repositorio" : "Search repository"}
          />
          {query && (
            <button className="tree-clear-btn has-tooltip" data-tooltip={lang === "es" ? "Limpiar búsqueda" : "Clear search"} aria-label={lang === "es" ? "Limpiar búsqueda" : "Clear search"} onClick={() => setQuery("")}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
              </svg>
            </button>
          )}
          <div className="tree-filter-wrap">
            <button className={"tree-filter-clear" + (hasFilter ? " active" : "")} onClick={clearFilter} aria-label={lang === "es" ? "Limpiar filtro" : "Clear filter"}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
              </svg>
            </button>
            <button
              className={"tree-filter-toggle has-tooltip" + (filterOpen ? " open" : "") + (hasFilter ? " has-filter" : "")}
              data-tooltip={hasFilter ? (lang === "es" ? `Filtro: .${filterExt}` : `Filter: .${filterExt}`) : (lang === "es" ? "Filtrar por tipo" : "Filter by type")}
              aria-label={lang === "es" ? "Filtrar por tipo" : "Filter by type"}
              aria-expanded={filterOpen}
              onClick={() => { setFilterOpen(v => !v); if (!filterOpen) setFilterSearch(""); }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/>
              </svg>
              {hasFilter && <span className="tree-filter-dot" />}
            </button>
          </div>
        </div>

        {/* Filter badge: displays ONLY when a type filter is active */}
        {filterBadgeName && (
          <div className="tree-active-badge">
            <span className="tree-badge-name">{filterBadgeName}</span>
            <button
              onClick={clearFilter}
              aria-label={lang === "es" ? "Quitar filtro" : "Clear filter"}
            >
              ×
            </button>
          </div>
        )}

        {/* Full-width dropdown with grey headers and hoverable category rows */}
        {filterOpen && (
          <div className="tree-filter-dropdown" role="dialog">
            <div className="tree-filter-search-row">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                autoFocus
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && fsTerm) applyExt(fsTerm); }}
                placeholder={lang === "es" ? "Buscar o escribir extensión…" : "Search or type extension…"}
              />
              {filterSearch && <button className="tree-filter-search-clear" onClick={() => setFilterSearch("")}>×</button>}
            </div>
            <div className="tree-filter-list">
              {filteredCats.map(cat => {
                const isCollapsed = collapsed.has(cat.id);
                return (
                  <div key={cat.id} className="tree-filter-cat">
                    <button
                      className="tree-filter-cat-header"
                      onClick={() => {
                        if (cat.exts.length === 1) {
                          applyExt(cat.exts[0]);
                        } else {
                          toggleCollapse(cat.id);
                        }
                      }}
                    >
                      <span className="tree-filter-cat-chevron">{isCollapsed ? "›" : "⌄"}</span>
                      <span>{cat.label[lang === "es" ? "es" : "en"]}</span>
                    </button>
                    {!isCollapsed && cat.exts.map(ext => (
                      <button key={ext} className={"tree-filter-ext-row" + (filterExt === ext ? " active" : "")} onClick={() => applyExt(ext)}>
                        {ext === "folder" ? <FolderIcon open={false} size={12} /> : <FileKindIcon path={`file.${ext}`} size={12} />}
                        <span>{ext === "folder" ? (lang === "es" ? "Todas las carpetas" : "All folders") : `.${ext}`}</span>
                        {filterExt === ext && <span className="ext-check">✓</span>}
                      </button>
                    ))}
                  </div>
                );
              })}
              {customNotInList && (
                <button className="tree-filter-use-custom" onClick={() => applyExt(fsTerm)}>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
                  {lang === "es" ? `Usar ".${fsTerm}" como filtro` : `Use ".${fsTerm}" as filter`}
                </button>
              )}
              {filteredCats.length === 0 && !customNotInList && (
                <div className="tree-filter-no-results">{lang === "es" ? "Sin resultados" : "No results"}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="tree-scroll">
        {results ? (
          <div className="tree-results">
            {visibleFolders.map(path => (
              <button key={path} className="tree-search-result" onClick={() => { onSelect(path, true); setQuery(""); }}>
                <FolderIcon open={false} size={13} />
                <span><strong>{path.split("/").pop()}</strong><small>{path}</small></span>
              </button>
            ))}
            {visibleFiles.map(path => (
              <button key={path} className="tree-search-result" onClick={() => { onSelect(path, false); setQuery(""); }}>
                <FileKindIcon path={path} size={13} />
                <span><strong>{path.split("/").pop()}</strong><small>{path}</small></span>
              </button>
            ))}
            {totalShown < totalFound && (
              <small className="tree-no-results">
                {lang === "es" ? `Mostrando ${totalShown} de ${totalFound} resultados…` : `Showing ${totalShown} of ${totalFound} results…`}
              </small>
            )}
            {totalFound === 0 && (
              <div className="tree-no-results-empty">
                <div className="empty-search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <strong>{lang === "es" ? "Sin resultados" : "No results"}</strong>
                <span>{lang === "es" ? "No encontramos archivos que coincidan." : "No matching files found."}</span>
              </div>
            )}
          </div>
        ) : children.map((item) => (
          <TreeRow
            key={item.path}
            item={item}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
            defaultOpen={defaultOpen}
            highlightedPaths={highlightedPaths}
          />
        ))}
      </div>
    </aside>
  );
}
