# Contrato: Detección de Iconos e Inventario (`detect-icons.md`)

## Objective

Analizar un repositorio para determinar cómo el Design System proporciona sus iconos, diferenciar los iconos de los componentes de interfaz, localizar archivos de activos vectoriales dedicados (`assets`, `icons`, `svg`) y reflejar con precisión la card de Iconos en el canvas visual y en la guía del proyecto.

---

## Reglas Críticas del Contrato

```text
IconButton ≠ ICON (IconButton es un COMPONENTE, NO un icono)
COMPONENT ≠ ICON (Los componentes de UI usan iconos, pero no son iconos)
ASSETS/ICONS/SVG = UBICACIÓN REAL DE ICONOS (Los iconos residen en archivos dedicados separados)
```

### 1. Regla de Exclusión de `IconButton`
- **`IconButton` (y variantes como `IconButton.tsx`, `IconButtonActionBar`, `IconButtonFloating`, `IconButtonShowcase`) son COMPONENTES de interfaz.**
- **REGLA ESTRICIA:** Ningún archivo nombrado `IconButton` o que implemente un botón con icono debe ser clasificado como archivo de icono. Se clasifica única y exclusivamente como **Componente (`component`)**.

### 2. Ubicación de los Iconos en el Repositorio
- Los iconos **NUNCA** se almacenan dentro de los componentes de UI.
- Residen en archivos vectoriales o módulos de iconos dedicados y separados, típicamente ubicados en:
  - Carpetas o archivos con nombres como `assets/`, `icons/`, `svg/`, `icon/`, `SVGIcon/`, `vectors/`.
  - Archivos `.svg` individuales (excluyendo logos, favicons, ilustraciones o banners).

---

## Nodos en el Canvas y Guía del Proyecto

1. **Carril de Iconos en el Canvas (`icon` / `icons`):**
   - El canvas de ReactFlow debe categorizar los nodos de iconos en su correspondiente tag/layer de iconos (`n.tag === "icon"` o `n.layer === "icons"`).

2. **Conteo en Project Guide:**
   - La card de métrica **Iconos** en la guía del proyecto debe coincidir exactamente con el número de tarjetas (nodos) de la categoría de iconos presentes en el canvas (`nodes.filter(n => n.tag === "icon" || ["icons", "assets"].includes(n.layer))`).
   - Al hacer clic en la tarjeta de métrica de Iconos, el canvas debe resaltar e iluminar únicamente las cards de la categoría de iconos.

---

## Detección de Librerías Externas
- Librerías externas o suites del sistema (ej. Octicons `@primer/octicons-react`, Lucide `lucide-react`, Tabler, Heroicons, FontAwesome) se muestran bajo la sección **Información** como `Iconos: Lucide` con su enlace oficial.
