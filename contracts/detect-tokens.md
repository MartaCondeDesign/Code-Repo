# Contrato de detección — Design Tokens

## Definición

Un Design Token es un valor reutilizable que representa una decisión de diseño del sistema.

No es un token: una constante de programación (`MAX_RETRIES`), un valor hardcoded sin nombre semántico, ni un valor que solo se usa una vez.

---

## Niveles

| Nivel | Descripción | Ejemplo |
|---|---|---|
| **Primitive** | Valor base sin intención contextual | `blue.500 = #0066FF` |
| **Semantic** | Intención de uso | `background.primary → blue.500` |
| **Component** | Específico de un componente | `button.background.hover` |

---

## Señales de archivo

### Directorios que indican tokens

```
/tokens/
/design-tokens/
/variables/
/theme/ o /themes/
/primitives/
/semantic/
/foundations/
/palette/
/colors/
/typography/
/spacing/
/dimensions/
/shadows/
```

### Nombres de archivo que indican tokens

```
colors.{json,yaml,yml,js,ts}
spacing.{json,yaml,yml,js,ts}
typography.{json,yaml,yml,js,ts}
tokens.{json,json5}
variables.css
theme.{js,ts}
palette.{js,ts}
*.tokens.json
```

### Extensiones en contexto DS

`.json` `.json5` `.yaml` `.yml` `.js` `.ts` `.mjs` `.css` (solo si contiene Custom Properties en `:root`)

---

## Señales de contenido

### CSS Custom Properties en `:root` o `[data-theme]`

```css
:root {
  --color-brand-primary: #0066ff;
  --spacing-md: 16px;
  --radius-sm: 4px;
}
```

Clasifica como token si el nombre sigue un patrón semántico (`--color-`, `--spacing-`, `--font-`, `--radius-`, `--shadow-`, `--motion-`, `--z-`).

### Formato DTCG (Design Tokens Community Group)

```json
{
  "color": {
    "brand": {
      "$type": "color",
      "$value": "#0066FF"
    }
  }
}
```

La presencia de `$value` + `$type` es señal fuerte.

### Objetos JS/TS exportados

```ts
export const colors = {
  blue500: "#0066FF",
  textPrimary: "#111111"
}
export const spacing = { xs: "4px", sm: "8px", md: "16px" }
```

### Referencias entre tokens (alias)

```css
var(--color-blue-500)
```
```json
{ "$value": "{color.blue.500}" }
```
```ts
theme.colors.primary
```

---

## Tags de nodo en el mapa DS

| Campo | Valores |
|---|---|
| `node.tag` | `"tokens"` |
| `node.layer` | `"tokens"`, `"foundation"` |

Los archivos de estos nodos son la fuente principal del conteo.

---

## Origen del archivo

| Clasificación | Señales |
|---|---|
| **Source of Truth** | Fichero editado manualmente, fuente del sistema |
| **Generated** | Contiene `generated`, `do not edit`, `dist/`, `build/`, `output/` |
| **Unknown** | Sin señales claras |

No contar el mismo token varias veces si aparece en formatos transformados (Web, iOS, Android).

---

## Nivel de confianza

| Nivel | Criterio |
|---|---|
| **High** | DTCG `$value`+`$type`, CSS Custom Properties en `:root` con naming semántico, directorio `/tokens/` con estructura de categorías |
| **Medium** | Objeto JS exportado con valores de diseño, archivo `.json` con claves de categoría (color, spacing…) |
| **Low** | Constante aislada sin estructura de sistema, valor sin naming semántico |

No presentar elementos `Low` como tokens confirmados.

---

## Qué NO es un token

- `const MAX_ITEMS = 10` — constante funcional
- `padding: 17px` en un selector CSS — valor hardcoded
- Un archivo `.css` con selectores y propiedades de componentes — eso es un Style
- Un archivo `.json` de configuración de herramientas (Babel, ESLint, Vite…)

---

## Regla principal

**Token = decisión de diseño reutilizable y nombrada.**

Evalúa siempre: formato + estructura + naming + reutilización + relaciones + contexto del repositorio.
