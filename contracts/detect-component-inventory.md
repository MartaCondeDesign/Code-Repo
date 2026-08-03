# Detect Design System Component Inventory

## Objetivo

Analiza un repositorio de GitHub y determina **cuántos componentes reales, públicos y activos forman parte del Design System**.

Este dato se utilizará en una Project Guide / Project Card.

No cuentes archivos: cuenta componentes.

---

# Regla principal

```text
FILE ≠ COMPONENT
EXPORT ≠ COMPONENT
STORY ≠ COMPONENT
VARIANT ≠ COMPONENT
STATE ≠ COMPONENT
```

Ejemplo:

```text
Button/
├── Button.tsx
├── Button.types.ts
├── Button.styles.ts
├── Button.stories.tsx
├── Button.test.tsx
└── index.ts
```

Esto representa **1 componente: Button**, no 6.

---

# Qué debes devolver

```text
COMPONENT INVENTORY

Public active component families: X
Public component exports: Y
Deprecated components: Z
Experimental components: W

Primary inventory source:
<ruta o mecanismo>

Primary component location:
<ruta>

Framework:
<React / Vue / Angular / Svelte / Web Components / SwiftUI / Compose / Flutter / etc.>

Architecture:
<Single package / Monorepo / Multi-package / Registry-based / Mixed>

Confidence:
<High / Medium / Low>
```

Para la cifra principal de la Project Card, utiliza por defecto:

**Public active component families**

---

# Orden de búsqueda

No dependas de una única estrategia. Revisa en este orden:

## 1. Manifest o registry oficial

Busca:

- `components.json`
- `registry.json`
- `registry.ts`
- `component-manifest.json`
- `manifest.json`
- `custom-elements.json`
- metadata equivalente

Un registry puede contener también blocks, examples, hooks, themes o utilities. Cuenta únicamente entradas que representen componentes.

---

## 2. `package.json > exports`

Revisa:

- `package.json`
- `packages/*/package.json`
- `libs/*/package.json`

Busca especialmente:

- `exports`
- `main`
- `module`
- `types`
- `files`
- `workspaces`

Ejemplo:

```json
{
  "exports": {
    "./button": "./src/button.tsx",
    "./dialog": "./src/dialog.tsx"
  }
}
```

Los subpath exports pueden ser la API pública aunque no exista `src/index.ts`.

---

## 3. Barrel files / public entry points

Busca, entre otros:

```text
src/index.ts
src/index.tsx
src/index.js
components/index.ts
ui/index.ts
packages/*/src/index.ts
packages/*/index.ts
```

Ejemplo:

```ts
export { Button } from "./Button"
export { Input } from "./Input"
export { Dialog } from "./Dialog"
```

El barrel file es frecuente, **pero no universal**.

Sigue cada export hasta la implementación real.

---

## 4. Packages de componentes

En monorepos puede haber un package por componente:

```text
packages/button/
packages/input/
packages/dialog/
```

No esperes siempre un único `packages/ui/src/index.ts`.

Revisa también:

- `pnpm-workspace.yaml`
- `lerna.json`
- `nx.json`
- `turbo.json`
- `rush.json`
- `package.json > workspaces`

---

## 5. Directorios de implementación

Busca como señal secundaria:

```text
/components/
/ui/
/src/components/
/src/ui/
/packages/ui/
/packages/components/
/libs/ui/
/shared/ui/
/design-system/components/
```

El nombre de una carpeta **no demuestra** que todo su contenido sean componentes públicos.

---

# Excepciones importantes

## No todos los npm Design Systems tienen barrel file

Puede ocurrir que:

- usen `package.json > exports`
- tengan un entry point por componente
- generen el barrel durante build
- cada componente sea un package independiente
- exista un manifest o registry en vez de un index central

Por eso nunca dependas solo de `src/index.ts`.

---

## Monorepos con varios tipos de packages

Ejemplo:

```text
packages/
├── components/
├── tokens/
├── icons/
├── hooks/
├── utilities/
├── themes/
└── docs/
```

No cuentes cada package como componente.

Clasifica antes:

- Components
- Tokens
- Icons
- Hooks
- Utilities
- Themes
- Foundations
- Documentation
- Tooling

---

## Public API vs componentes internos

No todo componente encontrado en `/components/` pertenece al Design System público.

Ejemplo:

```text
Button
Input
Dialog
InternalFocusTrap
DocsExample
StoryWrapper
```

Clasifica:

- `PUBLIC_COMPONENT`
- `INTERNAL_COMPONENT`
- `UNKNOWN`

Para la Project Card cuenta por defecto solo `PUBLIC_COMPONENT`.

Prioriza la API pública definida por exports, manifests o registries.

---

## Component families / compound components

Un único componente puede exportar múltiples partes:

```text
Dialog
DialogTrigger
DialogPortal
DialogOverlay
DialogContent
DialogTitle
DialogDescription
DialogClose
```

No asumas automáticamente que son 8 componentes.

Si el Design System los presenta como una sola unidad:

```text
Component family: Dialog
Public exports: 8
Component count: 1
```

Devuelve ambas métricas cuando sea útil:

```text
Component families: X
Public component exports: Y
```

Para la Project Card prioriza **component families**.

---

## Subcomponents

Ejemplos:

```text
Card
CardHeader
CardContent
CardFooter
```

o:

```text
Select
SelectTrigger
SelectContent
SelectItem
```

Determina si las piezas forman una API compuesta del mismo componente antes de contarlas individualmente.

---

## Variants

No cuentes variantes como componentes:

```text
Button primary
Button secondary
Button destructive
Button small
Button large
```

Normalmente son:

```text
1 componente: Button
```

---

## States

No cuentes como componentes:

- hover
- pressed
- active
- focus
- disabled
- loading
- selected
- error

---

## Stories

No utilices `*.stories.*` como fuente primaria del inventario.

Ejemplos:

```text
Button.stories.tsx
ButtonExamples.stories.tsx
ButtonAccessibility.stories.tsx
```

pueden corresponder a **un único Button**.

Storybook puede además contener:

- patterns
- demos
- componentes internos
- componentes deprecated
- documentación
- varias stories del mismo componente

Clasifica los stories como `STORY`, no como componentes.

---

## Tests

No cuentes:

```text
*.test.*
*.spec.*
__tests__/
```

---

## Documentación

No cuentes:

```text
*.md
*.mdx
docs/
```

La documentación puede ayudar a validar el nombre oficial, pero no aumenta el component count.

---

## Examples, demos y fixtures

No cuentes automáticamente:

```text
examples/
demo/
demos/
playground/
sandbox/
fixtures/
__fixtures__/
```

---

## Componentes de la web de documentación

En un monorepo puede haber:

```text
apps/docs/components/
```

con elementos como:

- `DocsSidebar`
- `CodePreview`
- `PropsTable`
- `ExampleFrame`

No forman parte del Design System salvo que estén también en su API pública.

---

## Apps de producto dentro de monorepos

No cuentes componentes de:

```text
apps/web/
apps/dashboard/
apps/demo/
apps/playground/
```

si no pertenecen al package público del Design System.

---

## Reexports

Ejemplo:

```ts
export { Button } from "./Button"
```

Clasifica el archivo como `REEXPORT`.

Sigue la ruta hasta la implementación.

---

## Default export + named export

```ts
export default Button
export { Button }
```

representa **1 componente**, no 2.

---

## Aliases

Ejemplo:

```ts
export { Modal as Dialog }
```

Puede ser un alias del mismo componente.

No cuentes ambos sin verificar la implementación.

---

## Múltiples entry points al mismo archivo

Ejemplo:

```json
{
  "exports": {
    "./button": "./src/Button.tsx",
    "./button/index": "./src/Button.tsx"
  }
}
```

Esto sigue siendo **1 componente**.

Deduplica por implementación y API.

---

## Wrappers

Ejemplo:

```tsx
export function ProductButton(props) {
  return <Button {...props} />
}
```

Clasifica como `WRAPPER`.

Cuenta el wrapper solo si forma parte de la API pública del Design System y representa una unidad reusable propia.

---

## Librerías externas

Un Design System puede construir sus componentes sobre:

- Radix UI
- React Aria
- Headless UI
- Material UI
- Ark UI
- Floating UI

Ejemplo:

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"
```

Si el repositorio añade API, estilos, comportamiento o convenciones propias y exporta `Dialog`, puede contarse como componente del Design System.

---

## Third-party reexports puros

Ejemplo:

```ts
export { Button } from "@external/ui"
```

Si no existe implementación, wrapper ni API propia, clasifica:

`THIRD_PARTY_REEXPORT`

No lo cuentes automáticamente como componente propio.

---

## Generated files y build output

No dupliques:

```text
src/Button.tsx
dist/Button.js
lib/Button.js
```

si son la misma implementación.

Busca:

- `generated`
- `autogenerated`
- `do not edit`
- `dist`
- `build`
- `lib`
- `compiled`
- `codegen`

Prioriza la fuente editable original.

---

## Generated barrels

Un `index.ts` generado puede servir como inventario de API pública, aunque no sea Source of Truth.

En ese caso indica:

```text
Inventory source:
Generated export manifest
```

y sigue cada export hasta la implementación.

---

## Deprecated / legacy

Busca:

- `@deprecated`
- `deprecated`
- `legacy`
- `v1`
- versiones antiguas

Devuelve por separado:

```text
Active components: X
Deprecated components: Y
```

No mezcles versiones históricas con el conteo actual.

---

## Experimental

Busca:

- `experimental`
- `labs`
- `unstable`
- `alpha`
- `beta`

Devuelve:

```text
Stable components: X
Experimental components: Y
```

---

## Varias generaciones del DS

Puede existir:

```text
v1/
v2/
legacy/
next/
```

Identifica cuál es la versión actual y no sumes todos los árboles.

---

## Multi-framework

Puede existir:

```text
packages/react/
packages/vue/
packages/svelte/
```

con el mismo catálogo implementado varias veces.

Si representan el mismo Design System:

```text
Unique component families: 20
Framework implementations: 60
```

No reportes automáticamente `60 components`.

---

## Platform variants

Ejemplo:

```text
Button.web.tsx
Button.native.tsx
Button.ios.swift
Button.android.kt
```

Si todos representan el mismo Button:

```text
Component families: 1
Platform implementations: 4
```

---

## Hooks

No cuentes:

```text
useDialog
useFocusTrap
useMediaQuery
```

Clasifica `HOOK`.

---

## Utilities

No cuentes como componentes:

```text
cn
mergeClasses
composeRefs
createTheme
```

Clasifica `UTILITY`.

---

## Types, interfaces, enums y constants

No cuentes:

```ts
export type ButtonProps = ...
export interface ButtonProps ...
export enum ButtonSize ...
export const BUTTON_VARIANTS = ...
```

---

## Tokens y themes

No cuentes:

- tokens
- colors
- spacing
- typography
- themes

como componentes.

---

## Styles

No cuentes archivos de estilos como componentes.

---

## Icons

No sumes automáticamente cada icono al contador principal.

Ejemplo:

```text
AddIcon
RemoveIcon
SearchIcon
```

puede reportarse como:

```text
Icons: X
```

Si existe un componente público genérico `Icon`, ese sí puede contarse como 1 componente.

---

## Layout primitives

Componentes como:

- Box
- Stack
- Flex
- Grid
- Container

sí pueden contarse si forman parte de la API pública.

---

## Providers

Elementos como:

- ThemeProvider
- DesignSystemProvider
- ConfigProvider

pueden ser componentes públicos reales. Comprueba la API pública antes de descartarlos.

---

## Accessibility components

Componentes como:

- VisuallyHidden
- ScreenReaderOnly
- FocusTrap

pueden formar parte legítimamente del catálogo si son públicos.

---

## Headless components

Un componente no necesita tener estilos visuales para ser componente.

Popover, Combobox o Listbox pueden ser componentes válidos si encapsulan comportamiento y API reutilizable.

---

## Blocks, patterns y templates

No confundas:

- components
- patterns
- blocks
- recipes
- templates

Ejemplos:

```text
CheckoutFlow
DashboardLayout
LoginPage
```

Clasifica por separado como `PATTERN`, `BLOCK` o `TEMPLATE` si corresponde.

---

## Registry-based systems

Algunos sistemas no distribuyen todos los componentes desde un único package y usan un registry.

Ejemplo de tipos:

```text
registry:ui
registry:block
registry:example
registry:theme
registry:hook
```

Cuenta solo los tipos que representen componentes de UI.

No cuentes blocks, examples, themes, hooks o utilities como componentes.

---

# Frameworks: señales de implementación

## React

Busca `.tsx` / `.jsx` con señales como:

```tsx
export function Button(...)
export const Button = (...)
React.forwardRef(...)
```

y JSX real.

## Vue

Busca `.vue` con:

- `<template>`
- `defineProps`
- `defineEmits`
- slots

## Angular

Busca:

```ts
@Component(...)
```

Puede usar varios archivos:

```text
button.component.ts
button.component.html
button.component.scss
```

Todos juntos pueden representar 1 componente.

## Svelte

Busca `.svelte` con markup y API reutilizable.

## Web Components / Lit

Busca:

- `customElements.define`
- `HTMLElement`
- `LitElement`
- `@customElement`

## Stencil

Busca:

- `@Component`
- `@Prop`
- `@State`
- `@Event`

## SwiftUI

Busca:

```swift
struct X: View
```

## Jetpack Compose

Busca:

```kotlin
@Composable
fun X(...)
```

## Flutter

Busca:

```dart
class X extends StatelessWidget
class X extends StatefulWidget
```

---

# Clasificación de archivos

Clasifica archivos relevantes como:

- `COMPONENT_SOURCE`
- `COMPONENT_SUPPORT`
- `PUBLIC_ENTRY_POINT`
- `REEXPORT`
- `WRAPPER`
- `THIRD_PARTY_REEXPORT`
- `INTERNAL_COMPONENT`
- `STORY`
- `TEST`
- `DOCUMENTATION`
- `EXAMPLE`
- `PATTERN`
- `BLOCK`
- `TEMPLATE`
- `HOOK`
- `UTILITY`
- `TOKEN_SOURCE`
- `STYLE_SOURCE`
- `GENERATED`
- `CONFIGURATION`
- `UNKNOWN`

---

# Prioridad de fuentes

Para determinar el inventario oficial, utiliza esta prioridad:

```text
1. Manifest / registry oficial de componentes
2. package.json > exports
3. Public barrel / entry point
4. Package-level exports
5. Directorios de implementación
6. Storybook
7. Documentación / navegación
8. Búsqueda general del repositorio
```

Storybook y documentación son señales secundarias: sirven para validar o completar, no para contar ciegamente.

---

# Deduplicación

Deduplica usando conjuntamente:

- nombre público
- implementation path
- package
- aliases
- family
- framework/platform
- status

No dedupes solo por filename.

---

# Confidence

## High

El componente aparece en manifest, registry, `package.json > exports` o entry point público y puedes seguirlo hasta su implementación.

## Medium

La implementación reusable es clara y parece pública, pero el export oficial es ambiguo.

## Low

Puede ser interno, demo, wrapper, helper o componente de producto.

Para la Project Card evita contar `Low` como confirmado.

---

# Si no puedes confirmar el número

No inventes.

Devuelve:

```text
Component count:
Unknown

Candidate components:
X

Reason:
<por qué no existe evidencia suficiente>
```

---

# Output final para Project Guide

## Summary

```text
Public active component families: X
Public component exports: Y
Deprecated: Z
Experimental: W

Primary inventory source:
...

Primary implementation location:
...

Framework:
...

Confidence:
...
```

## Inventory

| Component family | Public exports | Implementation | Status | Confidence |
|---|---|---|---|---|

## Ignorados para el conteo

```text
Stories: X
Tests: X
Docs: X
Examples: X
Internal components: X
Generated files: X
```

Estos valores nunca deben sumarse al component count.

---

# Regla final de decisión

Antes de sumar un elemento a la Project Card verifica:

1. ¿Es una unidad de UI reusable?
2. ¿Forma parte de la API pública o inventario oficial?
3. ¿Puedes encontrar su implementación real?
4. ¿No es story, test, docs, hook, utility, token, style, demo o componente interno?
5. ¿No es una variante, estado, alias o subparte ya agrupada?
6. ¿Pertenece a la versión actual y activa?

Solo entonces:

```text
COUNT AS COMPONENT
```
