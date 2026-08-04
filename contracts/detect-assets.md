# Contrato: Detección de Assets (`detect-assets.md`)

## Objetivo

Detectar las carpetas de assets SVG de un repositorio y representarlas como nodos en el canvas dentro de su propio frame de Assets.

---

## Reglas críticas

```text
SVG = ÚNICO FORMATO VÁLIDO DE ASSET
TS / TSX / JS / JSX / VUE / SVELTE ≠ ASSET — son código, NUNCA assets
CARPETA = 1 NODO EN EL CANVAS
ASSETS TIENEN SU PROPIO FRAME — nunca dentro de Tokens ni Components
```

---

## 1. Formato: SOLO `.svg` — regla absoluta

El único formato válido para un asset es `.svg`. Ningún otro formato cuenta.

| Archivo | Clasificación |
|---|---|
| `arrow.svg` | ASSET ✓ |
| `icons/check.svg` | ASSET ✓ |
| `assets/logo.svg` | ASSET ✓ |
| `Arrow.tsx` | COMPONENTE ✗ — **nunca asset** |
| `ArrowIcon.tsx` | COMPONENTE ✗ — **nunca asset** |
| `icons/index.ts` | BARREL / MÓDULO ✗ — **nunca asset** |
| `Icon.jsx` | COMPONENTE ✗ — **nunca asset** |
| `icons/types.ts` | TIPOS ✗ — **nunca asset** |

**Los archivos `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`, `.svelte` son código** — componentes, módulos o tipos que pueden referenciar iconos, pero **no son assets en sí mismos**. Excluirlos siempre del conteo de assets.

---

## 2. Exclusiones

Se excluyen del conteo de iconos:

- `IconButton`, `IconButtonActionBar`, etc. → **Componente**, nunca icono.
- Archivos que contengan en su nombre: `logo`, `brand`, `wordmark`, `illustration`, `marketing`, `artwork`, `banner`, `hero`, `photo`, `screenshot`, `empty-state`, `favicon`, `apple-touch-icon`.
- Archivos en rutas de `dist/`, `build/`, `output/`.

---

## 3. La carpeta es la unidad, no el archivo

Los SVGs se almacenan dentro de una carpeta. Esa **carpeta** es la unidad que se representa en el canvas, no los archivos individuales.

**Regla de agrupación:**
- Buscar el primer segmento de la ruta con nombre `icons`, `icon`, `svg`, `iconography`, `vectors` o `glyphs`.
- Todos los SVGs bajo esa carpeta pertenecen al mismo nodo.
- Si no hay carpeta con ese nombre, usar la carpeta inmediata que contiene los SVGs.

**Resultado: 1 nodo por carpeta de iconos.**

```
public/icons/arrow.svg   ┐
public/icons/check.svg   ├── 1 nodo: title="icons", sub="public/icons"
public/icons/close.svg   ┘
```

El nodo tiene:
- `tag: "icon"`
- `layer: "icons"`
- `files[0]` = ruta de la carpeta (ej. `"public/icons"`) — para que el clic en canvas seleccione la carpeta en el árbol
- `files[1..n]` = rutas de los archivos SVG individuales

---

## 4. Frame propio en el canvas

Los assets **siempre** aparecen en su propio frame `layer: "icons"` (etiqueta "Assets").

```
┌─ Rules & Docs ───────────────┐
│ ...                          │
└──────────────────────────────┘
┌─ Tokens ─────────────────────┐
│ ...                          │
└──────────────────────────────┘
┌─ Assets ─────────────────────┐   ← frame exclusivo de assets SVG
│  [icons/]                    │
└──────────────────────────────┘
┌─ Components ─────────────────┐
│ ...                          │
└──────────────────────────────┘
```

**Nunca** aparecen dentro del frame de Tokens ni del frame de Components.

---

## 5. Card de Project Guide y comportamiento al hacer clic

- La card **Assets** en Project Guide muestra el número de **carpetas de assets** (nodos), no el número de archivos SVG.
- Si todos los SVGs están en una carpeta → la card muestra **1**.
- Al hacer clic en la card de Assets se producen **dos efectos simultáneos**:
  1. Se ilumina/selecciona la **card de la carpeta en el canvas**.
  2. Se ilumina/selecciona la **carpeta en el árbol izquierdo** del repositorio.

---

## 6. Iconos externos vs. assets internos — qué se muestra en Project Guide

```text
ICONOS EXTERNOS (librerías) → sección Información del Project Guide
ASSETS INTERNOS (SVGs propios) → card de métrica (nodo en canvas) — NO se mencionan en Información
```

### Iconos externos (librería de terceros)
- Detectados via `package.json` o imports: Lucide, Octicons, Heroicons, Tabler, FontAwesome, etc.
- **Se mencionan en la sección Información** del Project Guide: `Iconos: Lucide`.
- No generan nodo en el canvas — no hay archivos SVG propios.
- No suman al conteo de la card de métrica Assets.

### Assets internos (SVGs en el repositorio)
- Archivos `.svg` detectados en una carpeta del repositorio.
- **No se mencionan en la sección Información** — ya están representados por la card de métrica y el nodo en el canvas.
- La card muestra el número de carpetas de assets (normalmente 1).

### Si existen ambos
- Los iconos externos → sección Información.
- Los assets internos → card de métrica + nodo en canvas.
- No mezclar: la sección Información no duplica lo que ya muestra la card.
