# AGENTS.md

## Proyecto

Este repositorio contiene **Design System Map**, una aplicación React que muestra un mapa interactivo de las capas, recursos y conexiones de un sistema de diseño.

La interfaz principal se ejecuta con Vite en `http://localhost:4311/`. Las peticiones a `/api` se redirigen al servidor auxiliar configurado en `http://localhost:4314`.

## Estructura

- `src/App.jsx`: composición principal, filtros y estado de la aplicación.
- `src/map-data.js`: nodos, capas, conexiones y contenido del mapa.
- `src/map.css`: estilos globales de la interfaz.
- `src/ChatWidget.jsx`: panel de chat y consultas sobre el sistema.
- `src/LaneNode.jsx`: representación de las capas.
- `src/ChipNode.jsx`: representación de recursos y elementos.
- `src/LabeledEdge.jsx`: conexiones etiquetadas del grafo.
- `src/layout.js`: cálculo y organización del mapa.
- `server/`: API auxiliar de análisis.
- `dist/`: compilación estática generada; no debe editarse manualmente.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Reglas de trabajo

1. Edita los archivos fuente de `src/`; nunca hagas cambios manuales en `dist/`.
2. Conserva la aplicación bilingüe en español e inglés. Todo texto visible nuevo debe tener ambas variantes.
3. Mantén sincronizados los filtros laterales, los nodos visibles y las conexiones del grafo.
4. Cuando agregues una capa, un nodo o una relación, actualiza `src/map-data.js` y comprueba su posición y legibilidad en el mapa.
5. Reutiliza los componentes y estilos existentes antes de crear nuevas abstracciones.
6. Mantén la accesibilidad: controles con nombres descriptivos, navegación por teclado y estados visibles de foco.
7. No añadas secretos, credenciales ni rutas locales personales al repositorio.
8. No cambies los puertos `4311` y `4314` sin actualizar también la configuración y la documentación.
9. Las capas de fondo (`lane`) deben mantener siempre `zIndex: -1` para que las líneas de conexión (`edges`) y las tarjetas (`chip`) se muestren siempre por encima y visibles.
10. La disposición de las tarjetas (`chip`) en el lienzo debe seguir un diseño en rejilla (como el layout de 4 columnas) con un espaciado vertical amplio (`ROW_GAP = 96px`) para asegurar que el texto de subtítulos y de conexiones no se solape.
11. Las etiquetas de las conexiones (`edges`) deben usar fondos opacos y sólidos (como `#ffffff` o `var(--paper)`) para evitar que las líneas de conexión crucen de forma transparente por detrás y emborronen el texto. Además, cuando múltiples conexiones apunten al mismo nodo de destino, sus etiquetas deben apilarse verticalmente de forma dinámica (con un desplazamiento incremental de 18px en `labelOffsetY`) para prohibir por completo el solapamiento de textos de diferentes relaciones.
12. Tanto los archivos individuales como las carpetas del explorador de la izquierda deben disponer de explicaciones básicas y descriptivas en ambos idiomas en el panel del inspector de la derecha al ser clicados.
13. Las optimizaciones para repositorios grandes deben conservarse activas (umbral de contracción de carpetas en 150 archivos, límite de 100 resultados en búsquedas y memoización en el ordenamiento).
14. Para los archivos de documentación Markdown (`.md`), el inspector derecho no debe usar descripciones fijas genéricas; debe leer dinámicamente el contenido del archivo (`selectedCode`) para extraer y mostrar el primer encabezado `#` como título y el primer párrafo de texto como explicación detallada.
15. En la guía del proyecto, las secciones de librerías (iconos, componentes, tokens, etc.) deben ser estrictamente condicionales y solo renderizarse si se detectan dependencias correspondientes en `README.md`, `Gemfile` o `package.json`. No se deben añadir textos por defecto o inventar nombres si el escáner no encuentra dependencias reales.
16. El cálculo estadístico de componentes, páginas y layouts debe incluir extensiones generales y plantillas backend (`.rb`, `.erb`, `.haml`, `.html`, `.php`, `.py`, `.go`) para garantizar que la guía cuente correctamente los recursos en repositorios de cualquier tecnología (como Ruby on Rails).
17. La pantalla de carga que indica 'Leyendo la estructura...' y su subtítulo 'dame unos segundos...' deben tener un tamaño de letra unificado e idéntico de `14px` para una óptima lectura.

## Verificación antes de entregar

1. Ejecuta `npm run build` y corrige cualquier error.
2. Abre la aplicación y verifica el cambio en el navegador.
3. Comprueba los filtros de capas y conexiones.
4. Comprueba el cambio de idioma ES/EN.
5. Comprueba zoom, ajuste de vista e interactividad del mapa.
6. Si se modificó el chat o el análisis, verifica también el servidor auxiliar y los estados de error.

## Criterios de calidad

- La interfaz debe seguir siendo legible en distintos tamaños de ventana.
- Los datos del mapa deben tener identificadores estables y únicos.
- Las conexiones no deben apuntar a nodos inexistentes.
- Los cambios deben ser pequeños, claros y acordes con el estilo actual del proyecto.
- La compilación generada debe actualizarse únicamente mediante `npm run build` cuando sea necesario entregarla.

## Estándar de etiquetas de metadatos

- Todas las etiquetas grises pequeñas que introducen una sección deben compartir un único estilo. Ejemplos: `REPOSITORY`, `FOUNDATIONS`, `WHAT IT IS`, `WHAT IT DOES`, `CODE FILE` y `RELATED TO`.
- El estándar vive en las variables `--meta-label-*` de `src/map.css`: tamaño `10px`, peso `800`, interletrado `1px`, altura de línea `1.25`, color gris `#6b7280` y texto en mayúsculas.
- No declares tamaños, pesos, colores o interletrados distintos para una nueva etiqueta de este tipo. Reutiliza `.pane-kicker` o incluye el selector en el grupo del estándar.
- El cambio de idioma puede modificar el contenido de la etiqueta, pero nunca sus dimensiones tipográficas ni su tratamiento visual.
- Consulta también `design.md` antes de modificar la jerarquía tipográfica.
