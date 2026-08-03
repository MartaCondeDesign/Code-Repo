# Contrato: Detección Universal de Documentación Oficial Externa

Este contrato define las reglas y el algoritmo universal para descubrir, validar y extraer el enlace a la **Documentación Oficial para Humanos** de cualquier Design System a partir de un repositorio de GitHub, considerando las diferencias estructurales de cada repositorio (Monorepos con workspaces, paquetes únicos, sitios estáticos de documentación, etc.).

---

## 1. Dónde se encuentra la documentación en el repositorio de GitHub (Caso de Estudio: Astryx)

En repositorios como **Astryx (`facebook/astryx`)** y otros repositorios de sistemas de diseño, la URL oficial (`https://astryx.atmeta.com/docs/getting-started`) se localiza en 3 puntos clave del repositorio:

1. **`package.json` principal / `packages/docs/package.json`:**
   - La propiedad `"homepage": "https://astryx.atmeta.com/docs/getting-started"` o `"documentation": "..."`.
2. **`README.md` (Párrafo introductorio y Badges):**
   - El enlace markdown en la primera sección: `[Documentation](https://astryx.atmeta.com/docs/getting-started)` o en botones/badges de lectura.
3. **Archivos de configuración de sitio web (`docusaurus.config.js`, `astro.config.mjs`, `next.config.js`):**
   - El parámetro `url` o `baseUrl` que define el dominio público de despliegue del portal de documentación.

---

## 2. Algoritmo Universal de Extracción según el Tipo de Repositorio

Dado que cada repositorio de GitHub está estructurado de forma distinta, el analizador aplica el siguiente flujo jerárquico de inspección:

### Nivel 1: Análisis de Manifiestos de Paquetes (`package.json`)
- **Repositorio estándar:** Extrae `"homepage"`, `"documentation"` o `"website"` de la raíz `package.json`.
- **Monorepos (Workspaces / `packages/*`):** Inspecciona los `package.json` dentro de carpetas como `packages/docs`, `apps/docs`, `website/package.json` o los paquetes core.
- **Filtro:** Ignora URLs que apunten al repositorio fuente en `github.com`, priorizando sitios web externos dedicados para humanos.

### Nivel 2: Extracción en Archivos de Documentación (`README.md`, `README.mdx`, `docs/*.md`)
- Analiza todos los enlaces formateados en markdown `[Texto](https://...)` y etiquetas HTML `<a href="...">`.
- Prioriza enlaces con texto ancla como "Documentation", "Documentación", "Getting Started", "Guía", "Website", "Official Site".
- **Extracción de Badges de Shields (`img.shields.io`):** Si la documentación está embebida en la URL de una insignia/badge (ej. `img.shields.io/badge/Docs-astryx.atmeta.com-6741d9`), el sistema descompone la URL de la insignia, limpia los códigos de color hex y reconstruye la URL oficial del portal (`https://astryx.atmeta.com/docs/getting-started`).

### Nivel 3: Reconocimiento de Dominios y Rutas Oficiales
El motor busca coincidencias con los siguientes patrones de URL:
- **Dominios corporativos / Meta:** `*.atmeta.com`, `*.facebook.com`, `*.fb.com`
- **Dominios dedicados a sistemas de diseño:** `*.design`, `*.style`, `*.design-system.*`, `ds.*`
- **Portales de documentación SaaS:** `zeroheight.com`, `supernova.io`, `knapsack.cloud`
- **Rutas de documentación:** URLs públicas que contengan `/docs/`, `/getting-started`, `/components`, `/guidelines`.

---

## 3. Regla de Presentación Unificada en Project Guide

Cuando el sistema descubre la URL oficial de documentación por cualquiera de los métodos anteriores:

- **Sección:** **Información** del Project Guide.
- **Etiqueta Única:** `Documentación: Ver documentación` (en inglés: `Documentation: View documentation`).
- **Comportamiento:** Solo se muestra una única línea sin duplicados.
