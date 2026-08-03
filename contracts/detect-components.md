# Detect Component Source

## Objective

Analyze a repository and locate exclusively where reusable Design System components are IMPLEMENTED.

The main task is to answer:

**What real components exist, and in which file or minimal set of files is each one built?**

Do not confuse files with components.
Do not confuse consumers, stories, tests, documentation, examples, or re-exports with the component implementation.

---

# Main rule

```text
FILE ≠ COMPONENT
```

A component may require one or several files.

React example:

```text
Button/
├── Button.tsx
├── Button.types.ts
├── Button.module.css
├── Button.test.tsx
├── Button.stories.tsx
└── index.ts
```

This means:

```text
1 component: Button
```

Not:

```text
6 components
```

The primary implementation file is likely:

```text
Button.tsx
```

and may depend on:

```text
Button.types.ts
Button.module.css
```

Tests, stories, and index files are NOT separate components.

---

# What you must find

For each detected component, return:

```text
COMPONENT

Name:
Button

Primary implementation:
<exact path>

Supporting implementation files:
- <path>
- <path>

Framework:
<React / Vue / Angular / Svelte / Web Components / SwiftUI / Compose / Flutter / etc.>

Implementation type:
<Source / Generated / Wrapper / Primitive / Composite / Unknown>
```

---

# What is a Design System component

Consider something a component if it is a reusable interface unit that:

- encapsulates structure and/or behavior
- has a reusable API
- can receive props, inputs, parameters, or modifiers
- is used across multiple screens or products
- represents a recognizable piece of UI
- is part of a shared library, package, module, or system

Examples:

- Button
- Input
- Checkbox
- Radio
- Select
- Tabs
- Tooltip
- Dialog
- Modal
- Drawer
- Card
- Badge
- Avatar
- Accordion
- Table
- DatePicker
- Breadcrumb
- Pagination
- Toast

---

# Formats where a component may be implemented

## React

Look primarily for:

- `.tsx`
- `.jsx`

Examples:

```text
Button.tsx
Button.jsx
```

May also depend on:

- `.ts`
- `.js`
- `.css`
- `.scss`
- `.module.css`
- `.module.scss`

---

## Vue

Look for:

- `.vue`

Example:

```text
Button.vue
```

The same file may contain:

```text
<template>
<script>
<style>
```

---

## Angular

A single component may be spread across:

- `.component.ts`
- `.component.html`
- `.component.css`
- `.component.scss`

Example:

```text
button.component.ts
button.component.html
button.component.scss
```

This represents:

```text
1 component
```

The `.component.ts` file usually acts as the implementation entry point, but consider the full set.

---

## Svelte

Look for:

- `.svelte`

Example:

```text
Button.svelte
```

---

## Web Components

Look for:

- `.ts`
- `.js`

with signals such as:

```text
customElements.define
HTMLElement
LitElement
@customElement
```

Common frameworks:

- Lit
- Stencil
- FAST
- Vanilla Web Components

---

## Stencil

Look primarily for:

- `.tsx`

with signals such as:

```text
@Component
@Prop
@State
@Event
```

---

## iOS / SwiftUI

Look for:

- `.swift`

with signals such as:

```swift
struct Button: View
var body: some View
```

There may be multiple auxiliary files:

```text
DSButton.swift
DSButtonStyle.swift
DSButtonConfiguration.swift
```

Do not automatically count them as three components.

---

## UIKit

Look for:

- `.swift`
- `.xib`
- `.storyboard`

and reusable classes based on:

- UIView
- UIControl
- UIButton
- UITableViewCell
- UICollectionViewCell

---

## Android / Jetpack Compose

Look for:

- `.kt`

and composable functions:

```text
@Composable
```

Example:

```kotlin
@Composable
fun Button(...)
```

There may also be auxiliary files:

```text
Button.kt
ButtonDefaults.kt
ButtonTokens.kt
```

Do not automatically count them as separate components.

---

## Traditional Android

Look for:

- `.kt`
- `.java`
- `.xml`

There may be:

- custom Views
- XML layouts
- styles
- attributes

Determine what the actual reusable implementation is.

---

## Flutter

Look for:

- `.dart`

and classes such as:

```text
StatelessWidget
StatefulWidget
```

Example:

```dart
class DSButton extends StatelessWidget
```

---

## Other frameworks

Do not dismiss other formats.

Always look for evidence of a reusable UI unit with its own API.

---

# How to identify the primary file

To consider a file as `COMPONENT_SOURCE`, look for signals of real implementation.

## React

Strong signals:

```tsx
export function Button(...)
```

```tsx
export const Button = (...)
```

```tsx
const Button = React.forwardRef(...)
```

```tsx
function Button(...)
```

with JSX return.

Also:

- props
- variants
- slots
- children
- refs
- events
- state
- accessibility attributes
- composition

---

## Vue

Look for:

- `<template>`
- `defineProps`
- `defineEmits`
- slots
- component exports

---

## Angular

Look for:

```ts
@Component(...)
```

and:

- selector
- template
- templateUrl
- inputs
- outputs

---

## Svelte

Look for:

- reusable markup
- exported props
- slots
- component events

---

## SwiftUI

Look for:

```swift
struct X: View
```

and:

```swift
var body: some View
```

---

## Compose

Look for:

```kotlin
@Composable
fun X(...)
```

---

## Flutter

Look for:

```dart
class X extends StatelessWidget
```

or:

```dart
class X extends StatefulWidget
```

---

# What is NOT a Component Source

Do NOT classify as primary implementation a file that only:

- imports the component
- renders the component
- re-exports the component
- documents the component
- shows examples
- contains stories
- contains tests
- contains snapshots
- contains demos
- contains fixtures
- contains playgrounds
- contains product pages
- contains layouts that only consume components
- contains registry files without implementation
- contains metadata without implementation
- contains generated output when an original source exists

---

# Stories

Example:

```text
Button.stories.tsx
```

This is NOT the component.

Even if it contains:

```tsx
<Button variant="primary" />
```

it is only using/documenting the component.

Classify as:

```text
STORY
```

---

# Tests

Examples:

```text
Button.test.tsx
Button.spec.ts
```

These are NOT components.

Classify as:

```text
TEST
```

---

# Documentation

Examples:

```text
Button.mdx
Button.md
button.docs.ts
```

These are NOT the implementation.

Classify as:

```text
DOCUMENTATION
```

---

# Re-exports / barrel files

Example:

```ts
export { Button } from "./Button"
```

or:

```ts
export * from "./button"
```

Do not mark this as a component.

Use it only to follow the reference back to the real file.

Classify as:

```text
REEXPORT
```

---

# Consumer files

Example:

```tsx
import { Button } from "@design-system/ui"

export function Checkout() {
  return <Button>Pay</Button>
}
```

This file CONSUMES Button.

It is not the component source.

Classify as:

```text
CONSUMER
```

---

# Wrappers

There may be:

```tsx
export function ProductButton(props) {
  return <DSButton {...props} />
}
```

Determine whether it is:

- a new reusable component with its own API
- a wrapper of the base component
- a product-specific adaptation

Classify as:

```text
WRAPPER
```

when it only wraps or adapts another component.

Do not confuse it with the base Design System component.

---

# Generated components

Look for signals such as:

- generated
- autogenerated
- do not edit
- dist
- build
- codegen
- generated from

If an original source exists:

```text
Source component → generated component
```

prioritize the original source.

Classify the output as:

```text
GENERATED
```

---

# Primitive and composite components

When there is sufficient evidence, classify as:

## Primitive

Basic reusable component.

Examples:

- Button
- Input
- Text
- Icon
- Checkbox

## Composite

Component built from other components.

Examples:

- Dialog
- DatePicker
- DataTable
- Combobox
- NavigationMenu

## Wrapper

Wraps another component.

## Unknown

Not enough evidence.

Do not use this classification to exclude components.

---

# Components based on external libraries

A Design System may wrap Radix, Headless UI, React Aria, Material, etc.

Example:

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"

const DialogContent = React.forwardRef(...)
```

This file CAN be a Design System implementation if it:

- adds its own API
- applies its own styles
- defines variants
- adds behavior
- establishes conventions
- is exported as a reusable system component

Do not discard a component because it uses an external library.

Indicate:

```text
External dependency:
@radix-ui/react-dialog
```

---

# Compound components

A single component system may export multiple pieces:

```text
Dialog
DialogTrigger
DialogContent
DialogHeader
DialogFooter
DialogTitle
```

Do not automatically assume each export is an independent inventory component.

Determine whether they form part of the same family.

Return:

```text
Component family:
Dialog

Parts:
- Dialog
- DialogTrigger
- DialogContent
- DialogHeader
- DialogFooter
- DialogTitle
```

For the main count, use the component/family unit that best represents the Design System.

If you cannot determine this with confidence, report both metrics:

```text
Component families: X
Exported component parts: Y
```

---

# Variants are NOT new components

Example:

```text
Button primary
Button secondary
Button destructive
Button small
Button large
```

This normally represents:

```text
1 component: Button
```

with multiple variants.

Do not count each variant as a separate component.

Extract:

- component
- variant name
- variant values

---

# States are NOT new components

Examples:

- Default
- Hover
- Pressed
- Focus
- Disabled
- Loading
- Error

These are states of the same component.

Do not increase the component count.

---

# Multi-file components

A component may be defined across several required files.

Example:

```text
Button/
├── Button.tsx
├── Button.types.ts
├── Button.styles.ts
└── Button.variants.ts
```

Return:

```text
Component:
Button

Primary implementation:
Button.tsx

Supporting implementation:
- Button.types.ts
- Button.styles.ts
- Button.variants.ts
```

Do not convert them into four components.

---

# How to find the Source of Truth

For each component:

1. Find where it is exported or used.
2. Follow imports/re-exports to the implementation.
3. Identify the file where the UI is declared/rendered.
4. Identify auxiliary files needed for its API or behavior.
5. Discard stories, tests, docs, and consumers.
6. Check whether the file is generated.
7. Prioritize the editable original source.

---

# Common folders

Look especially in:

```text
/components/
/ui/
/src/components/
/src/ui/
/packages/ui/
/packages/components/
/packages/design-system/
/libs/ui/
/shared/ui/
/design-system/components/
```

But:

```text
folder name ≠ evidence
```

The folder is a hint, not proof.

---

# DS node map tags

| Field | Values |
|---|---|
| `node.tag` | `"component"` |
| `node.layer` | `"components"`, `"ui"` |

Files in these nodes are the primary source for counting.

---

# Canvas display rule

When the Components metric card is active, **ALL** component nodes must be visible and highlighted in the canvas — no cap on the number of displayed nodes.

Every node with `tag === "component"` or `layer === "components"` or `layer === "ui"` must be included. No component identified in the map may be excluded from the canvas highlight when the Components filter is active.

The backend analyzer must not impose an arbitrary limit on the number of component nodes it generates. If a repository has 150 components, 150 nodes must appear.

---

# Component counting

`Components: X` must represent:

```text
number of real reusable components
```

Never:

- number of files
- number of stories
- number of ungrouped exports
- number of variants
- number of states
- number of tests
- number of consumers
- number of demos

If you cannot determine a reliable count:

```text
Component count: Unknown
```

Do not substitute that value with the number of files.

---

# File classification

Each relevant file must be classified as:

- `COMPONENT_SOURCE`
- `COMPONENT_SUPPORT`
- `WRAPPER`
- `CONSUMER`
- `REEXPORT`
- `STYLE_SOURCE`
- `TOKEN_SOURCE`
- `STORY`
- `TEST`
- `DOCUMENTATION`
- `EXAMPLE`
- `GENERATED`
- `CONFIGURATION`
- `UNKNOWN`

---

# Information to extract

For each component:

- Component name
- Component family
- Primary implementation file
- Exact path
- Supporting implementation files
- Framework
- Language
- Component type
- External dependency
- Props / Inputs
- Variants
- States
- Slots / Children
- Events
- Accessibility behavior
- Style source
- Token usage
- Export path
- Source / Generated
- Confidence

---

# Required output

## 1. Component Source

First return:

```text
COMPONENTS LOCATION

Primary location:
<exact path>

Architecture:
<Centralized / Package-based / Co-located / Mixed>

Framework:
<framework>

Component families:
X

Implementation files:
X
```

Remember:

```text
Component families ≠ Implementation files
```

---

## 2. Inventory

| Component | Primary implementation | Supporting files | Framework | Type |
|---|---|---|---|---|

Include only confirmed components or those with sufficient confidence.

---

## 3. Evidence

For each component, show brief evidence of real implementation.

Example:

```text
Button
packages/ui/src/button.tsx

Evidence:
export const Button = React.forwardRef(...)
```

No need to copy the full implementation.

---

## 4. Related files

If useful, report separately:

```text
Stories: X
Tests: X
Documentation files: X
Consumer files: X
Generated files: X
```

Never add these numbers to the component total.

---

# Final rule

Before marking something as a component, ask:

> Does this file or set of files IMPLEMENT a reusable UI unit with its own structure, API, or behavior?

If not:

```text
NOT a Component Source
```

And always remember:

```text
FILE ≠ COMPONENT

COMPONENT = reusable UI unit
SOURCE FILE = file where it is implemented
SUPPORT FILE = file needed to complete the implementation
CONSUMER = file that only uses the component
```
