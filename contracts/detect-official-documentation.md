# Contrato: Detección de Documentación Oficial Externa

Este contrato define las reglas y el algoritmo para descubrir, validar y presentar el enlace a la **Documentación Oficial para Humanos** de un Design System desde un repositorio de GitHub (ej. Astryx `https://astryx.atmeta.com/docs/getting-started`, Primer `https://primer.style`, Zeroheight, Supernova, etc.).

---

## 1. Jerarquía de Fuentes para Descubrimiento

El analizador debe inspeccionar el repositorio en la siguiente secuencia prioritaria:

### 1.1 Campo `homepage` o `documentation` en `package.json`
- Se examina la raíz `package.json` y paquetes principales (`packages/*/package.json`).
- Si el campo `homepage` contiene un enlace HTTP/HTTPS válido que apunte a un sitio de documentación (ej. `https://astryx.atmeta.com`, `https://primer.style`, `https://mui.com`), se toma como fuente primaria oficial.

### 1.2 Enlaces y Badges en `README.md`, `README.mdx` y `docs/*.md`
- Se busca dentro de los primeros párrafos, badges y secciones de documentación en `README.md`.
- Se extraen URLs que coincidan con los patrones de dominio y rutas oficiales.

---

## 2. Patrones de Dominios y Rutas Reconocidos

1. **Dominios Corporativos y de Meta/Facebook:**
   - `*.atmeta.com` (ej. `astryx.atmeta.com/docs/getting-started`)
   - `*.facebook.com`, `*.fb.com`
2. **Dominios dedicados a Design Systems (`.design`, `.style`):**
   - `*.design` (ej. `polaris.shopify.design`)
   - `*.style` (ej. `primer.style`)
   - `*.design-system.*`, `ds.*`
3. **Plataformas de Documentación de Design Systems:**
   - `zeroheight.com`
   - `supernova.io`
   - `knapsack.cloud`
   - `figma.com/@*`
4. **Rutas de documentación en sitios de marca:**
   - URLs que incluyan `/docs/`, `/getting-started`, `/components`, `/guidelines` en portales oficiales.

---

## 3. Regla de Presentación en Project Guide

Cuando se detecte una URL oficial de documentación externa:

1. **Ubicación:** Sección **Información** del Project Guide.
2. **Formato de Texto Obligatorio:**
   - Español: `Documentación: Ver documentación` (donde "Ver documentación" es un enlace hipervinculado a la URL descubierta).
   - Inglés: `Documentation: View documentation` (donde "View documentation" es el enlace hipervinculado).
