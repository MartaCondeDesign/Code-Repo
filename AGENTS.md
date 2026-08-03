# AGENTS.md

## Descripción general del proyecto

Este repositorio contiene **Code Repo** (anteriormente *Design System Map*), una aplicación React interactiva que genera mapas visuales detallados de las capas, recursos y conexiones de sistemas de diseño o repositorios de código. Su propósito es explicar el código en lenguaje de diseño para que cualquier perfil (como diseñadores de producto) entienda cómo está construido el software.

### Estructura de archivos locales:
- `src/App.jsx`: Composición principal, filtros, menús de importación y estado de la aplicación.
- `src/map-data.js`: Nodos iniciales, capas predeterminadas y conexiones estáticas del mapa base.
- `src/map.css`: Estilos globales de la interfaz y variables tipográficas.
- `src/ChatWidget.jsx`: Widget de chat interactivo para realizar consultas directas sobre el repositorio mapeado.
- `src/LaneNode.jsx`: Representación gráfica de las capas contenedoras en el lienzo.
- `src/ChipNode.jsx`: Tarjetas de recursos visuales y archivos.
- `src/LabeledEdge.jsx`: Conexiones con etiquetas descriptivas del flujo de datos/importaciones.
- `src/file-descriptions.js`: Generador bilingüe de descripciones dinámicas para ficheros y directorios (con soporte especial para leer el título y el cuerpo de archivos `.md`).
- `src/layout.js`: Motor de organización visual en cuadrícula de 4 columnas.
- `server/`: Código backend en NodeJS encargado de clonar repositorios externos y ejecutar el mapeo estático de archivos.

---

## Tech stack

- **Frontend Core:** React 18, Vite 6, JavaScript ESM.
- **Visualización de diagramas:** `@xyflow/react` (React Flow v12).
- **Tipografías:** `Inter` (interfaz estándar) y `@fontsource/opendyslexic` (para el lector inclusivo).
- **Backend Analyzer:** Node.js, `es-module-lexer` y utilidades nativas de análisis estático.
- **Entorno de ejecución:** 
  - Cliente Vite: `http://localhost:4311/`
  - Servidor de análisis API: `http://localhost:4314/`

---

## Arquitectura

La aplicación organiza la información en tres capas principales:
1. **Lienzo Gráfico (React Flow):** Renderiza los carriles (`lanes`) con orden de apilamiento `zIndex: -1` y las tarjetas de archivo (`chips`). Las conexiones (`edges`) enlazan visualmente el flujo de importaciones, consumo de tokens y dependencias de la UI de forma persistente.
2. **Explorador del repositorio (Árbol de directorios):** Situado a la izquierda, permite navegar de forma jerárquica por todo el árbol del repositorio importado o buscar por términos/conceptos relacionados.
3. **Inspector lateral:** Situado a la derecha, muestra descripciones detalladas de "Qué es" y "Para qué sirve" del archivo, carpeta o nodo seleccionado en el lienzo.

---

## Repository discovery

Do not assume a fixed folder structure.

**Reading priority — always follow this order before running any detection contract:**

**Step 0 — `README.md`:** Read the official root README.md first. It is the primary source of truth: repo purpose, structure, external links, tech stack, framework, icon library, Storybook URL, documentation site. If it already provides the needed information, use it directly and skip the heuristic contract for that element.

**Step 1 — AI rules file:** After the README, read whichever AI rules/context file exists in the repository (first match wins):

| Program | File(s) |
|---|---|
| Claude Code | `CLAUDE.md`, `claude.md`, `.claude/CLAUDE.md` |
| Claude Code (agents) | `AGENTS.md`, `agents.md`, `agent.md` |
| Cursor | `.cursorrules`, `.cursor/rules/*.mdc` |
| Windsurf | `.windsurfrules`, `.windsurf/rules/*.md` |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Cline | `.clinerules`, `.cline/rules/*.md` |
| Aider | `.aider.conf.yml`, `CONVENTIONS.md` (if Aider-style) |
| Gemini CLI | `GEMINI.md`, `gemini.md` |
| OpenAI Codex | `CODEX.md`, `.codex` |
| Devin | `.devin/instructions.md` |
| Generic / custom | `AI_RULES.md`, `ai_rules.md`, `.rules`, `project.rules`, `CONTRIBUTING.md` |

The AI rules file describes how the repo is structured, its conventions, what tools it uses and how it organizes each layer (tokens, components, docs, icons…). This context improves every subsequent detection contract.

**Step 2 — Detection contracts:** Only after steps 0 and 1, run the heuristic contracts in `/contracts/detect-*.md` for each element not already resolved.

Before making UI changes, inspect the repository and identify where these resources live:

- Design tokens
- Global styles and themes
- Icons
- Illustrations
- UI components
- Design patterns
- Product pages or features
- Documentation

Search using:

- Folder names
- File names
- Imports
- `package.json`
- Lockfiles
- Theme configuration
- CSS variables
- Existing component usage

Common locations may include:

- `src/components/`
- `src/ui/`
- `src/design-system/`
- `src/styles/`
- `src/tokens/`
- `src/assets/`
- `shared/`
- `packages/`
- `apps/`
- `docs/`

These are examples only. Do not assume they exist.

If a resource is not found in the expected location, search the whole repository by name, import path, or usage before concluding that it does not exist.

Always follow the repository's existing structure and conventions.

---

## Design System

Para mantener la consistencia estética y visual del proyecto, sigue estas especificaciones:

- **Tipografía:** `Inter` como fuente por defecto. Si se activa la ayuda de lectura, la interfaz de usuario cambia a `OpenDyslexic` pero los bloques de código monoespaciados conservan su tipografía `--font-code`.
- **Etiquetas de metadatos:** Las cabeceras y Kickers grises (ej. `REPOSITORY`, `FOUNDATIONS`, `WHAT IT IS`, `CODE FILE`) comparten un estándar visual unificado en `--meta-label-*` (`10px` de tamaño, `800` de peso, `1px` de interletrado, color gris `#6b7280` y todo en mayúsculas). No declares estilos locales redundantes.
- **Botones:** 
  - Primario: Fondo azul sólido `#2563eb` con texto blanco.
  - Secundario (Guide, etc.): Fondo blanco `#ffffff`, borde `1px solid #bfdbfe` y texto azul `#1d4ed8`.
- **Paneles redimensionables:** Las barras divisorias cambian el cursor al posicionar el puntero, pero no muestran líneas ni indicadores visuales invasivos en estado de reposo.

---

## Guía de voz y tono

- **Concisión:** Las respuestas del chat de asistencia y los widgets deben ser sumamente breves y directas al grano, evitando explicaciones redundantes o repetición de datos.
- **Bilingüismo:** La aplicación es estrictamente bilingüe (Español / Inglés). Al añadir cualquier cadena de texto visible en UI, recuerda registrar tanto su traducción en `es` como en `en` dentro del objeto `STRINGS` de `App.jsx`.

---

## Testeo / Quality bar

- **Diseño Responsive:** Los contenedores e inputs deben permitir el wrap de textos sin desbordar ni provocar solapamientos ante traducciones extensas de idiomas.
- **Scroll vertical:** Mantén scroll activo en los paneles laterales para que todo el contenido sea accesible cuando el espacio en pantalla sea limitado.
- **Estabilidad de IDs:** Todos los nodos y elementos gráficos del lienzo deben poseer IDs estables y predecibles.

---

## Reglas

1. Edita únicamente los archivos de origen de `src/`; no alteres la compilación estática de `dist/` a mano.
2. Conserva la funcionalidad bilingüe en español e inglés en todo texto visible.
3. Sincroniza siempre los filtros laterales, los nodos visibles y las conexiones del grafo.
4. Las capas contenedoras (`lane`) deben mantener siempre `zIndex: -1` para que las líneas de conexión (`edges`) y las tarjetas (`chip`) se muestren por encima de estas sin quedar ocultas.
5. La rejilla del lienzo utiliza un layout fijo con un espaciado vertical amplio (`ROW_GAP = 96px`) para asegurar que el texto y las etiquetas de conexión no se solapen.
6. Las etiquetas de las conexiones (`edges`) deben usar fondos opacos y sólidos (como `#ffffff` o `var(--paper)`) para evitar que las líneas de conexión crucen de forma transparente por detrás y emborronen el texto.
7. Cuando múltiples conexiones apunten al mismo nodo de destino, sus etiquetas deben apilarse verticalmente de forma dinámica (con un desplazamiento incremental de 18px en `labelOffsetY`) para prohibir por completo el solapamiento de textos de diferentes relaciones.
8. Las conexiones deben mostrarse siempre al 100% de opacidad y no atenuarse a un estado casi invisible cuando se interactúe con el lienzo.
9. Tanto los archivos como las carpetas del explorador de la izquierda deben tener explicaciones descriptivas en ambos idiomas en el panel del inspector de la derecha.
10. Para archivos Markdown (`.md`), el inspector derecho leerá dinámicamente el contenido del archivo para mostrar su título principal y primer párrafo en el panel.
11. En la guía del proyecto, las categorías de librerías (iconos, componentes, tokens, animaciones, etc.) son estrictamente condicionales; si no se detectan dependencias reales de esa categoría en los archivos analizados (como `discovery.md`, `README.md`, `Gemfile` o `package.json`), la sección no se dibuja y no se inventan valores genéricos.
12. El cálculo estadístico de componentes, páginas y layouts incluye extensiones generales y plantillas backend (`.rb`, `.erb`, `.haml`, `.html`, `.php`, `.py`, `.go`) para dar soporte a cualquier tecnología.
13. La pantalla de carga que indica 'Leyendo la estructura...' y su subtítulo 'dame unos segundos...' deben tener un tamaño de letra unificado e idéntico de `14px` para una óptima lectura.
14. Las optimizaciones para repositorios grandes deben conservarse activas (umbral de contracción de carpetas en 150 archivos, límite de 100 resultados en búsquedas y memoización en el ordenamiento).
15. Si en el repositorio analizado coexisten archivos de reglas `agents.md` (o `agent.md`) y `claude.md`, el backend de análisis los fusiona y agrupa bajo un único nodo de reglas unificado en el mapa para evitar duplicaciones visuales.
16. Al hacer clic en las tarjetas de métricas de la guía del proyecto (Tokens, Componentes, Documentación, etc.), la interfaz activa un resaltado por categoría que ilumina tanto las tarjetas correspondientes en el lienzo (canvas) como los archivos asociados en el árbol del repositorio izquierdo (tree row), aplicando un borde lateral azul a las filas correspondientes.
17. Al hacer clic en un elemento dentro de los resultados de búsqueda del explorador izquierdo, el buscador se limpia automáticamente (`setQuery("")`), cerrando la lista de resultados para regresar a la estructura del árbol de ficheros y posicionar e iluminar el archivo seleccionado tanto en el explorador como en el lienzo canvas.
18. El dropdown de sistemas de diseño de la cabecera muestra una lista de 25 repositorios de código abierto más populares representados únicamente por su nombre, sin descripciones adicionales.
19. Al intentar analizar un repositorio, el backend intenta clonarlo primero de forma pública. Si la descarga falla debido a restricciones de autorización (error AUTH_REQUIRED), la interfaz detiene la carga y activa automáticamente un modal de diálogo que solicita su Token de Acceso Personal (PAT) con opción de guardado en localStorage.
20. El icono de la llave (🔑) permanece oculto por defecto y solo se muestra al lado de la barra de búsqueda si hay un token guardado o ingresado, sirviendo como acceso para modificar o eliminar dicho token.
21. Las búsquedas exitosas de repositorios se almacenan como búsquedas recientes en localStorage (mostrando un máximo de 4 elementos ordenados por los más recientes) en la parte superior del dropdown del buscador.
22. Al hacer clic en cualquier nodo (chip) del canvas, siempre se deben producir dos efectos simultáneos: (a) iluminar/seleccionar el archivo correspondiente en el árbol del repositorio izquierdo (tree), expandiendo las carpetas necesarias para que sea visible; y (b) abrir el panel de información derecho (inspector) mostrando los detalles de ese nodo.
23. El buscador del árbol de repositorio (tree) filtra únicamente por coincidencia directa de texto en el nombre de ruta del archivo. No realiza expansión conceptual ni búsqueda semántica por sinónimos; solo devuelve archivos cuya ruta normalizada contiene exactamente la cadena de búsqueda introducida.
24. La detección de componentes del Design System sigue dos contratos en orden: primero `contracts/detect-component-inventory.md` (¿cuántos componentes oficiales?) priorizando barrel files, registries y package.json exports; después `contracts/detect-components.md` (¿dónde está construido cada uno?). El número mostrado en la card siempre proviene del inventario, no del conteo de archivos.
25. Sin emojis en la interfaz: No se deben usar emojis para representar iconos ni acciones visuales en la interfaz. Utilizar únicamente iconos vectoriales SVG. El icono de la llave (SVG) en el buscador solo se muestra en repositorios que requieran un token. La detección de assets del Design System se rige por el contrato `contracts/detect-assets.md`.
30. Assets en Project Guide — externos vs. internos: Si los assets de icono provienen de una librería externa (Lucide, Octicons, Heroicons, Tabler, etc.), se mencionan únicamente en la sección de Información del Project Guide (ej. "Assets: Lucide"). Si son internos (archivos `.svg` propios del repositorio), NO se mencionan en la sección de Información — ya están representados por su card de métrica "Assets" y su nodo en el canvas. Si coexisten ambos tipos, los externos van a Información y los internos a la card; nunca se duplica la información entre las dos secciones.
26. Storybook no es un framework UI: Storybook es una herramienta de entorno de desarrollo y documentación, por lo que nunca debe listarse dentro de la categoría Otros/Frameworks en la guía del proyecto. Storybook solo se muestra en su enlace dedicado si se detecta la URL oficial de despliegue propia del repositorio (ej. Chromatic, GitHub Pages), y jamás se debe enlazar a la web genérica storybook.js.org.
27. Análisis de README y Documentación Externa: El sistema debe analizar `package.json` (campos homepage y documentation), `README.md` y archivos de documentación para extraer enlaces a la documentación oficial externa para humanos (ej. `*.atmeta.com`, `primer.style`, Zeroheight, Supernova, web propia del DS). Cuando se detecte una URL oficial, se muestra en la sección Información de Project Guide etiquetada como `Documentación: Ver documentación` con su enlace activo.
28. Límite de 200 elementos por categoría: En el canvas y en el Project Guide no se pueden mostrar más de 200 elementos por cada categoría (componentes, tokens, documentación o iconos). Si un repositorio excede de 200 elementos en cualquiera de estas categorías, el canvas renderiza únicamente los primeros 200 y la tarjeta de métricas de la guía del proyecto indica el total con el distintivo '+' (ej. 221+) e informa en su tooltip que el canvas muestra los primeros 200 elementos.
29. Privacidad y Cero Almacenamiento de Datos: Está estrictamente prohibido guardar, almacenar o persistir código fuente, datos de repositorios analizados o tokens de acceso en bases de datos o servidores externos. Todo el análisis se realiza exclusivamente en memoria volátil de sesión única y los tokens de acceso personal solo se utilizan localmente de forma efímera para autenticar las llamadas a la API de GitHub.
30. Conteo de Cards del Canvas en la Guía del Proyecto: El número mostrado en cada tarjeta de métrica de 'NÚMERO DE ARCHIVOS' (Componentes, Tokens, Documentación e Iconos) en la guía del proyecto debe coincidir exactamente con el número total de tarjetas (nodos) que aparecen en el canvas para esa categoría. Por ejemplo, si en el canvas se muestran 4 tarjetas de iconos, la card de Iconos debe mostrar exactamente 4.
31. Sin duplicidad en la sección Información: Queda estrictamente prohibido duplicar información o enlaces en la sección Información del Project Guide. Solo debe aparecer una única entrada para 'Documentación: Ver documentación' (eliminando la entrada redundante de 'Docs:'), y cada tecnología o framework debe aparecer en una sola categoría sin repetirse (ej. Tailwind CSS no debe figurar en Tokens y simultáneamente en Otros/Frameworks).
32. Detección Universal de Documentación Oficial Externa: Dado que cada repositorio de GitHub está estructurado de forma distinta (monorepos, paquetes únicos, carpetas de documentación), la detección de la web oficial de documentación se rige por el contrato `contracts/detect-official-documentation.md`. El analizador debe inspeccionar jerárquicamente: (1) `homepage` o `documentation` en `package.json` raíz y paquetes workspaces (`packages/*/package.json`), (2) enlaces markdown y badges en `README.md` o `docs/*.md`, y (3) patrones de dominios corporativos (`*.atmeta.com`, `primer.style`, `zeroheight.com`, `supernova.io`, `*.design`, `*.style` o rutas `/docs/`).
33. Clasificación de Iconos vs Componentes y Carril de Iconos en el Canvas: `IconButton` es un COMPONENTE de interfaz, NO un icono. Queda strictly prohibido clasificar `IconButton` o sus variantes como archivos de icono. Los iconos residen en archivos vectoriales dedicados (`assets/`, `icons/`, `svg/`). En el canvas visual de ReactFlow debe existir un carril dedicado de Iconos (`icons`), y la tarjeta de métricas de Iconos del Project Guide debe contar y señalar exactamente las tarjetas de iconos presentes en el canvas.
34. Tipografía y Color Unificado en la Pantalla de Carga: Ambas líneas de texto en el overlay de carga (`.loading-overlay p` y `.loading-overlay .loading-sub`) deben tener de manera obligatoria y uniforme un tamaño de fuente de `14px !important`, peso de fuente **regular** (`font-weight: 400 !important`) y color negro puro `#000000 !important`. No se permiten pesos en negrita ni colores grises en el texto de carga.
35. Orden de lectura obligatorio — README → AI rules → contratos: Para detectar cualquier elemento del repositorio (componentes, assets, tokens, iconos, documentación, storybook, framework, gráficos u otros), el backend sigue siempre este orden: **(1)** leer el `README.md` raíz del repositorio; **(2)** leer el archivo de reglas/contexto de IA del repositorio (AGENTS.md, CLAUDE.md, .cursorrules, .windsurfrules, .github/copilot-instructions.md, .clinerules, GEMINI.md, CODEX.md, .devin/instructions.md, CONVENTIONS.md, AI_RULES.md, .rules, etc.); **(3)** solo si la información buscada no se ha encontrado en los pasos anteriores, ejecutar el contrato heurístico específico (`contracts/detect-*.md`). Los pasos 1 y 2 tienen prioridad absoluta sobre cualquier inferencia heurística.
36. Sección Assets en el canvas — todos los SVG del repositorio: El mapa visual debe incluir una sección/carril dedicada a Assets (layer `icons`, label "Assets") que muestra TODOS los archivos `.svg` del repositorio, agrupados por carpeta (1 nodo por carpeta). Se excluyen únicamente los SVG dentro de directorios de tests (`__tests__`, `__mocks__`, `e2e`) y archivos de stories/spec. Se incluyen logos, ilustraciones, iconos, banners y cualquier otro SVG. Al hacer clic en la card "Assets" de Project Guide se iluminan todos los nodos de esta sección en el canvas y sus carpetas en el árbol.
37. El repositorio es la fuente de verdad del canvas: Toda card (nodo) que aparezca en el mapa visual DEBE estar respaldada por al menos un archivo o carpeta real del repositorio (campo `files[]` del nodo). El árbol del repositorio izquierdo es la fuente de verdad: si un recurso no existe como archivo en el repositorio, no puede aparecer en el canvas. Al hacer clic en cualquier nodo del canvas, la carpeta o archivo correspondiente debe quedar seleccionado y visible en el árbol. Nunca se crean nodos con rutas inventadas o sin respaldo en el árbol de ficheros real.
38. Detección y Conteo de Archivos `styles.css` como Tokens/Estilos: Los archivos de hojas de estilo globales o principales del sistema de diseño (tales como `styles.css`, `style.css`, `styles.scss`, `style.scss`, `styles.less`, `global.css`, `base.css`, `tokens.css` y similares) deben ser detectados obligatoriamente como archivos de tokens/estilos (`isTokenFile`). Deben aparecer representados en el mapa visual de ReactFlow en la capa de `tokens` y contarse en la tarjeta de métricas de 'TOKENS' de la guía del proyecto.
39. Previsualización Visual y Detalles Ricos en el Panel Inspector Derecho: El panel de inspección de la derecha debe mostrar detalles informativos completos del archivo seleccionado (explicación de qué es y contiene, lenguaje, extensión y líneas de código). Asimismo, para recursos visuales y componentes de interfaz —tales como imágenes (.png, .jpg, .gif, .webp, .ico), vectores SVG (.svg), documentos PDF (.pdf) y componentes de UI (.jsx, .tsx, .vue, .svelte)— el panel debe renderizar obligatoriamente un bloque de previsualización visual (`FileVisualPreview`) con renderizado inline o demostraciones interactivas.
40. Prohibición Absoluta de Tooltips Recortados y Recolocación Automática según los Bordes del Viewport: Queda estrictamente prohibido que un tooltip sobresalga o sea recortado por los bordes de la pantalla/frame (`window.innerWidth`, `window.innerHeight`). En elementos situados cerca de las esquinas o bordes (tales como el botón flotante FAB `.guide-fab`, botones del panel inspector derecho o controles de cabecera), el sistema de tooltips debe calcular automáticamente los límites del viewport y reposicionar o invertir la orientación del tooltip (hacia la izquierda o arriba/abajo) manteniendo siempre un margen de seguridad (`margin >= 10px`) para garantizar la legibilidad total del mensaje.
41. Prohibición de Registros de Paquetes como Documentación Oficial (npmjs.com): Los enlaces a registros de paquetes como `npmjs.com` (ejemplo `https://www.npmjs.com/package/@primer/react`), `npmjs.org`, `yarnpkg.com`, `pypi.org`, `crates.io`, `rubygems.org` o similares NUNCA pueden ser clasificados como sitios de documentación oficial. No pueden devolverse como `OFFICIAL_DOCUMENTATION` ni aparecer en las tarjetas de métricas o enlaces de documentación de Project Guide.

---

## Contratos de detección del Design System

Cada parte del Design System que aparece como card de métrica en la guía del proyecto tiene un contrato de detección en la carpeta `/contracts/`. Los contratos definen qué es cada parte, cómo detectarla en el código fuente y cómo clasificar los resultados.

### Contratos disponibles

| Parte DS | Contrato | Card en guía |
|---|---|---|
| Assets (SVG icons) | [`contracts/detect-assets.md`](contracts/detect-assets.md) | Assets |
| Component Inventory | [`contracts/detect-component-inventory.md`](contracts/detect-component-inventory.md) | Componentes (número) |
| Component Source | [`contracts/detect-components.md`](contracts/detect-components.md) | Componentes (archivos) |
| Design Tokens | [`contracts/detect-tokens.md`](contracts/detect-tokens.md) | Tokens |
| Styles | [`contracts/detect-styles.md`](contracts/detect-styles.md) | — |
| Storybook | [`contracts/detect-storybook.md`](contracts/detect-storybook.md) | — (link only) |
| Icon Source & Inventory | [`contracts/detect-icons.md`](contracts/detect-icons.md) | Iconos |
| Official Documentation | [`contracts/detect-official-documentation.md`](contracts/detect-official-documentation.md) | Información (link) |

### Reglas generales de detección

0. **Orden de lectura obligatorio antes de cualquier contrato:** (1) `README.md` raíz → (2) archivo de reglas de IA del repositorio (AGENTS.md, CLAUDE.md, .cursorrules, copilot-instructions.md, etc. — ver tabla completa en "Repository discovery") → (3) contratos `contracts/detect-*.md`. Si los pasos 0 o 1 ya resuelven la información buscada, el contrato correspondiente no se ejecuta.
1. **Los conteos de las cards** usan archivos pertenecientes a **nodos del mapa DS** (node-based), no escaneo genérico de `/src`. La detección genérica solo sirve para `hasDesignSystem`.
2. **Tokens vs Styles:** Un archivo `.css` que solo define Custom Properties en `:root` es un token, no un style. Un archivo `.module.css` con selectores de componente es un style.
3. **Archivos generados:** No contar como fuente de verdad archivos en `dist/`, `build/`, `output/` o con comentario `do not edit`.
4. **Documentación:** La card de Documentación cuenta **todos** los archivos de docs (file-scan + nodos), no solo los de nodos DS.

### Cómo añadir un nuevo contrato

1. Crear `contracts/detect-{nombre}.md` siguiendo la estructura: definición, señales de archivo, señales de contenido, tags de nodo, clasificación y confianza.
2. Actualizar esta tabla en AGENTS.md.
3. Actualizar los Sets de detección en `src/ProjectGuide.jsx` (función `design` useMemo).
4. Añadir la regla correspondiente en este archivo.

---

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor local de desarrollo (Vite)
npm run dev

# Compilar activos de producción
npm run build

# Previsualizar compilación local
npm run preview
```

---

## Flujo de trabajo

1. **Investigar primero:** Antes de realizar cambios, asegúrate de verificar el comportamiento actual y leer las guías de diseño.
2. **Bypass Sandbox:** Las operaciones de compilación que requieran acceso a dependencias externas o validación de red del sistema de PostCSS de Vite, así como comandos CLI externos (como `git push` o `npx vercel`), deben ejecutarse con la opción `BypassSandbox: true` para evitar restricciones de puerto y lectura de ficheros.
3. **Subida y Despliegue:** Para subir los cambios a GitHub e iniciar una nueva compilación en Vercel, ejecuta:
   ```bash
   git add .
   git commit -m "feat: descripción de tus cambios"
   git push origin main
   npx vercel deploy --prod --yes
   ```
