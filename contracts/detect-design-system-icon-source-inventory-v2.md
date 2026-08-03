# Detect Design System Icon Source and Inventory

## Objective

Analyze a repository and determine how the Design System provides icons.

The goal is NOT only to count icon files.

The goal is to answer:

1. Does the Design System have icons?
2. Are the icons stored internally in the repository?
3. Are the icons imported from an external icon library?
4. Is the system mixed: internal icons + external library?
5. Which repository file proves where the icons come from?
6. Which files contain or expose the icon set?
7. How many icons can be reliably identified?
8. What should be shown in the Project Guide?

---

# Main rule

```text
ASSET ≠ ICON
FILE ≠ ICON
ICON LIBRARY ≠ ICON FILE
ICON IMPORT ≠ LOCAL ICON SOURCE
```

Icons may come from:

```text
A. LOCAL ICON SOURCE
B. EXTERNAL ICON LIBRARY
C. MIXED SOURCE
```

The detector must identify which case applies.

---

# What counts as an icon

An icon is a reusable symbolic UI element used for:

- actions
- navigation
- status
- feedback
- objects
- concepts
- controls

Examples:

- Search
- Add
- Close
- ChevronDown
- ArrowLeft
- Settings
- User
- Calendar
- Warning
- Check
- Download
- Menu

Do NOT count by default:

- photos
- illustrations
- videos
- screenshots
- marketing graphics
- logos
- brand marks
- favicons
- app store icons
- background artwork

---

# What the Project Guide needs

1. **In the Icons metric card (`design-metrics`):**
   - If an internal/private icon set is used, display the number of icon files (`internalIconFiles.length`).
   - If an open-source external library is used, display the library name or link.
   - Clicking on the Icons card highlights all canvas chips containing icons as well as the matching file rows in the left panel tree explorer.

2. **In the Interface Libraries section (`design-libraries`):**
   - If an external open-source icon library is used, list the library name with its direct link (e.g. `Tabler Icons`, `Lucide`, etc.).
   - If no external open-source icon library is present (or if only internal icon files exist), do NOT render an `Iconos:` line under Interface Libraries.

3. **No extra summary cards:**
   - Do not render separate extra boxes or summary cards for icon metadata in the Project Guide view.

---

# Critical requirement: evidence file

The evidence file may be:

- `package.json`
- `index.ts`
- `icons.ts`
- `Icon.tsx`
- `registry.ts`
- `theme.ts`
- component file
- barrel file
- configuration file
- any repository file that clearly proves the icon source

Do NOT require the file to be named `icons.*`.

---

# Source model A — Internal icons

Icons may be stored directly in the repository.

Possible structures:

```text
/icons/
  search.svg
  close.svg
  add.svg
```

or:

```text
src/icons/
  SearchIcon.tsx
  CloseIcon.tsx
  AddIcon.tsx
```

---

# Source model B — External icon libraries

A Design System may use an external open-source icon library.

Examples include:

- Lucide
- Heroicons
- Material Symbols / Material Icons
- Phosphor Icons
- Radix Icons
- Feather Icons
- Remix Icon
- Tabler Icons
- Bootstrap Icons
- Iconoir
- Carbon Icons
- Fluent UI Icons

---

# Source model C — Mixed

A Design System may use both internal icons and external library icons.

---

# Final decision tree

Ask these questions in order:

```text
1. Is there an official internal icon registry/package/folder?
   YES → inspect it and count internal icon files.

2. Is there an external icon library dependency?
   YES → identify library, evidence file, and URL.

3. Are files actually logos, illustrations, images, videos, or generic assets?
   YES → exclude them.
```
