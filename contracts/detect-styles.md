# Contrato de detección — Styles

## Definición

Un Style es la aplicación de una o más propiedades visuales a un componente o elemento de la interfaz.

No confundir con un Design Token, que es la decisión reutilizable.  
El style *consume* tokens; el token *define* decisiones.

```css
/* Token */
:root { --color-brand-primary: #0057ff; }

/* Style */
.button { background: var(--color-brand-primary); }
```

---

## Tecnologías que detectar

| Tecnología | Señales |
|---|---|
| **CSS** | `.css` con selectores y propiedades visuales |
| **CSS Modules** | `.module.css`, `.module.scss` |
| **Sass / SCSS** | `.scss`, `.sass` |
| **Less** | `.less` |
| **CSS-in-JS** | `styled.button\`…\``, `css({…})`, `createStyles({…})` |
| **Inline styles** | `style={{ padding: "16px" }}` en JSX/TSX |
| **Utility-first** | `className="bg-blue-600 px-4 py-2"` (Tailwind, UnoCSS) |
| **MUI `sx` prop** | `sx={{ color: "primary.main" }}` |
| **Chakra-style props** | `<Box p={4} color="brand.primary">` |
| **Style objects** | `const styles = { backgroundColor: colors.primary }` |

---

## Señales de archivo

### Extensiones principales

`.css` `.scss` `.sass` `.less` `.styl`  
`.module.css` `.module.scss`

### Archivos con estilos embebidos

`.vue` (bloque `<style>`)  
`.svelte` (estilos en el componente)  
`.tsx` `.jsx` `.ts` `.js` (CSS-in-JS, inline styles, style objects)

### Excluir como "style" del DS

- Archivos que solo contienen CSS Custom Properties en `:root` → son **tokens**
- Archivos de reset o normalize globales (`reset.css`, `normalize.css`, `base.css`)
- Archivos de configuración de herramientas

---

## Propiedades visuales que detectar

### Color
`color` · `background` · `backgroundColor` · `borderColor` · `fill` · `stroke` · `outline`

### Tipografía
`fontFamily` · `fontSize` · `fontWeight` · `lineHeight` · `letterSpacing` · `textTransform` · `textDecoration`

### Espaciado
`padding` · `margin` · `gap` · `rowGap` · `columnGap`

### Tamaño
`width` · `height` · `minWidth` · `maxWidth` · `minHeight` · `maxHeight`

### Borde
`border` · `borderWidth` · `borderStyle` · `borderColor` · `borderRadius`

### Sombra
`boxShadow` · `textShadow` · `elevation`

### Layout
`display` · `flex` · `grid` · `alignItems` · `justifyContent` · `position`

### Opacidad y movimiento
`opacity` · `transition` · `animation` · `transform`

---

## Clasificación de valores

| Tipo | Descripción | Ejemplo |
|---|---|---|
| **Token** | Referencia a una decisión nombrada | `var(--color-action-primary)`, `theme.colors.primary` |
| **Hardcoded** | Valor literal sin nombre semántico | `#232323`, `17px`, `11px` |
| **Calculated** | Valor computado dinámicamente | `calc(100% - 32px)` |
| **Token bypass** | Hardcode con valor coincidente con un token existente | `padding: 16px` cuando existe `--spacing-md: 16px` |

---

## Tipos de estilo

| Tipo | Descripción | Ejemplos |
|---|---|---|
| **Global** | Reset, base, tema global | `reset.css`, `body {}`, `:root {}` con reglas de layout |
| **Component** | Estilos de un componente específico | `Button.module.css`, `styled.button` |
| **Layout** | Estructura de páginas o zonas | `Grid.css`, `AppShell.module.scss` |
| **Utility** | Clases de utilidad reutilizables | `utilities.css`, `helpers.scss` |
| **Unknown** | Sin contexto suficiente | — |

---

## Estados y variantes que detectar

### Estados
`default` · `hover` · `focus` · `focus-visible` · `active` · `disabled` · `selected` · `checked` · `loading` · `error` · `success`

### Variantes
`size` (sm, md, lg) · `intent` (primary, danger, success) · `appearance` (filled, outlined, ghost) · `density` · `orientation`

---

## Themes y modos

Detecta cuándo los estilos cambian según:
- `light` / `dark` (`@media (prefers-color-scheme: dark)`, `[data-theme="dark"]`)
- Brands (`[data-brand="acme"]`)
- Plataforma (mobile vs desktop via media queries)

---

## Tags de nodo en el mapa DS

Los archivos CSS que aparecen en **cualquier nodo** del mapa DS se cuentan como styles del sistema.  
Los archivos CSS en nodos de tipo `tag="tokens"` o `layer="tokens"/"foundation"` se cuentan como **tokens**, no como styles.

---

## Nivel de confianza

| Nivel | Criterio |
|---|---|
| **High** | Archivo `.module.css` o `.scss` en directorio de componentes; `styled.X` o `css({})` en archivo de componente |
| **Medium** | Archivo `.css` con selectores de componentes, sin ser un archivo de tokens |
| **Low** | Archivo `.css` genérico sin selectores claros de componente |

---

## Regla principal

**Style = aplicación de decisiones visuales a un elemento concreto.**

Distingue siempre entre el token que define la decisión y el style que la aplica.  
Relaciona: `Component → Style → Token → Raw value`.
