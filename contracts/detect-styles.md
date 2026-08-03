# Detect Style Source

## Objective

Analyze a repository and locate exclusively where visual styles are DEFINED.

Do not search for every file that mentions styles.
Do not confuse files with styles.
Do not confuse consumer files with source files.

---

# Main rule

```text
FILE ≠ STYLE
```

A single file can contain multiple style rules or definitions.

Example:

```css
.button {}
.card {}
.input {}
```

This means:

```text
1 file
3 style rules
```

---

# What you must find

First answer:

```text
STYLES LOCATION

Architecture:
<Centralized / Co-located / CSS-in-JS / Utility-first / Mixed>

Primary source:
<exact path>

Definition files:
- <path>
- <path>

Number of definition files:
X

Number of style definitions:
X
```

If there is no single file, indicate the actual folder or pattern.

Example:

```text
Architecture:
Co-located component styles

Primary location:
/src/components/

Pattern:
**/*.module.css
```

---

# What is a style

A style is a rule or set of visual properties applied to an element, component, or state.

Example:

```css
.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: 8px;
}
```

Here there is one style rule: `.button`.

---

# Formats where styles may be defined

Look for definitions in:

- `.css`
- `.scss`
- `.sass`
- `.less`
- `.js`
- `.jsx`
- `.ts`
- `.tsx`
- `.vue`
- `.svelte`
- `.swift`
- `.kt`
- `.xml`
- `.dart`

Other formats may also exist depending on the technology.

---

# Styling technologies

Recognize:

- CSS
- CSS Modules
- SCSS
- Sass
- Less
- CSS-in-JS
- Styled Components
- Emotion
- Vanilla Extract
- Stitches
- StyleX
- Panda CSS
- Tailwind CSS
- UnoCSS
- Styled System
- MUI `sx`
- Chakra-style props
- Inline styles
- SwiftUI
- Jetpack Compose
- Flutter styles

---

# What counts as Style Source

A file is `STYLE_SOURCE` if it contains real visual definitions.

CSS example:

```css
.button {
  padding: 16px;
}
```

CSS Module example:

```css
.root {
  display: flex;
  gap: var(--spacing-md);
}
```

Style Object example:

```ts
export const buttonStyles = {
  padding: spacing.md,
  borderRadius: radius.md
}
```

Styled Components example:

```ts
const Button = styled.button`
  padding: ${theme.spacing.md};
`
```

---

# What does NOT count as Style Source

Do not classify as Style Source a file that only:

- imports CSS
- imports a theme
- imports a style object
- applies a className
- renders a component
- contains tests
- contains stories
- contains documentation
- contains demos
- contains snapshots

Example:

```tsx
import styles from "./Button.module.css"

return <button className={styles.button} />
```

This file consumes the style.

The definition is in:

```text
Button.module.css
```

---

# Centralized styles

Example:

```text
/src/styles/
  globals.css
  typography.css
  utilities.css
  components.css
```

Return:

```text
Architecture:
Centralized

Primary source:
/src/styles/
```

---

# Co-located styles

Example:

```text
/components/Button/Button.module.css
/components/Card/Card.module.css
/components/Input/Input.module.css
```

Return:

```text
Architecture:
Co-located

Primary location:
/components/

Pattern:
**/*.module.css
```

Do not invent a single file.

---

# CSS-in-JS

Styles may live in:

```text
Button.styles.ts
```

or directly in:

```text
Button.tsx
```

Example:

```ts
const styles = {
  root: {
    display: "flex",
    gap: spacing.md
  }
}
```

Return the real pattern:

```text
Architecture:
CSS-in-JS

Pattern:
**/*.styles.ts
```

or, if embedded:

```text
Architecture:
CSS-in-JS embedded in components
```

---

# Tailwind

Do not mark every file that contains `className` as Style Source.

Example:

```tsx
className="bg-primary px-4 rounded-md"
```

is consumption/application of utilities.

You must identify:

1. where the theme is defined
2. where CSS variables are defined
3. where utilities are configured
4. which files only consume the classes

Separate:

- configuration
- style definition
- utility usage
- token definition

---

# Tokens inside styles

Example:

```css
.button {
  background: var(--color-primary);
  border-radius: var(--radius-md);
  padding: 13px;
}
```

Classify:

| Property | Value | Type |
|---|---|---|
| background | `var(--color-primary)` | Token reference |
| border-radius | `var(--radius-md)` | Token reference |
| padding | `13px` | Hardcoded |

A token used inside a style is still a token.
The rule that uses it is a style.

---

# Hardcoded values

Detect:

- Hex
- RGB
- RGBA
- HSL
- px
- rem
- em
- dp
- sp
- opacity
- radius
- shadow
- duration
- easing

Classify them as:

```text
Hardcoded
```

If they match an existing token:

```text
Possible token bypass
```

Do not automatically convert them to tokens.

---

# Visual properties

Analyze:

## Color

- color
- background
- backgroundColor
- borderColor
- fill
- stroke

## Typography

- fontFamily
- fontSize
- fontWeight
- lineHeight
- letterSpacing

## Spacing

- padding
- margin
- gap

## Size

- width
- height
- minWidth
- maxWidth
- minHeight
- maxHeight

## Border

- border
- borderWidth
- borderColor
- borderRadius

## Shadow

- boxShadow
- textShadow
- elevation

## Layout

- display
- flex
- grid
- alignItems
- justifyContent
- position
- inset

## Motion

- transition
- animation
- transform

## Responsive

- media queries
- breakpoints
- container queries

---

# States

Detect rules related to:

- default
- hover
- pressed
- active
- focus
- focus-visible
- disabled
- selected
- checked
- loading
- error
- success
- warning
- read-only

---

# Variants

Detect:

- size
- hierarchy
- intent
- appearance
- emphasis
- tone
- density
- orientation
- inverse

---

# Counting

`Styles: X` must represent:

```text
number of style rules or visual definitions
```

Never:

- number of files
- number of imports
- number of components
- number of className occurrences
- number of files that mention styles

If you cannot count reliably:

```text
Style definition count: Unknown
```

Do not substitute with the number of files.

---

# DS node map tags

CSS files that appear in **any node** of the DS map are counted as system styles.
CSS files in nodes with `tag="tokens"` or `layer="tokens"/"foundation"` are counted as **tokens**, not as styles.

---

# Information to extract

For each relevant style:

- Style / selector name
- Component / element
- Property
- Value
- Token reference
- Hardcoded value
- State
- Variant
- Theme / Mode
- Responsive condition
- Styling technology
- Source file
- Exact file path
- Confidence

---

# Required output

## 1. Location

```text
STYLES LOCATION

Architecture:
...

Primary source:
...

Definition files:
...

Number of definition files:
...

Style definitions:
...
```

## 2. Technology

```text
Styling technologies:
- CSS Modules
- Tailwind
- CSS-in-JS
...
```

## 3. Evidence

Show real examples:

| Style | Component | File | Token usage | Hardcoded |
|---|---|---|---|---|

## 4. Related files

If useful:

```text
Consumer files: X
Configuration files: X
Generated files: X
```

Never add them to the style count.

---

# Final rule

Before marking a file as Style Source, ask:

> Does this file DIRECTLY DEFINE style rules or visual properties?

If the answer is no, it is not a Style Source.
