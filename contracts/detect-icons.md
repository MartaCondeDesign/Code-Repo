# Detect Design System Icon Source and Inventory

## Objective

Analyze a repository to determine how the Design System provides icons, locate any custom icon packages (such as GitHub Primer's Octicons), and discover official human documentation portals.

The detector answers:

1. Does the Design System have icons?
2. Are icons stored internally in the repository (SVG files, custom icon components)?
3. Are icons provided by an external or custom design system icon suite (e.g., Octicons `@primer/octicons-react`, Lucide, Tabler, Heroicons, FontAwesome)?
4. What is the official documentation URL for the icon suite (e.g., `https://primer.style/octicons/`)?
5. Is there an external human documentation website (Zeroheight, Supernova, custom `https://primer.style`, `https://*.design`, `https://*.style`) explaining the design system?
6. Which repository files match/reference the icon set?
7. What information must be rendered in the Project Guide?

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
A. LOCAL ICON SOURCE (SVG files, icon components in repository)
B. EXTERNAL / CUSTOM ICON SUITE (e.g. Octicons, Lucide, Tabler, Heroicons)
C. MIXED SOURCE (Local SVG files + External/Custom library)
```

---

# Detection Workflow

1. **Package Manifest & Code scanning:**
   Scan `package.json` dependencies and source code imports for known icon packages (`@primer/octicons-react`, `@primer/octicons`, `octicons`, `lucide-react`, `@tabler/icons-react`, `@heroicons/react`, `font-awesome`, `@phosphor-icons/react`, `@radix-ui/react-icons`, `@ant-design/icons`, `@chakra-ui/icons`, etc.).

2. **README & Documentation scanning:**
   Scan `README.md` and documentation markdown files (`.md`, `.mdx`) for explicit references to icon libraries as well as external human documentation site URLs (e.g. `https://primer.style/`, `https://primer.style/octicons/`, Zeroheight, Supernova, `https://*.design`, `https://*.style`).

3. **SVG & Icon Component scanning:**
   Scan `.svg` files in the repository while excluding non-icon assets (`logo`, `illustration`, `marketing`, `banner`, `hero`, `favicon`, `screenshot`, `artwork`). Valid vector SVG files and icon components belong to `internalIconFiles`.

---

# What the Project Guide needs

1. **Icons Metric Card (`design-metrics`):**
   - Displays `design.dsIconFiles` — the exact count of files in the project/canvas referencing icons.
   - Clicking on the Icons card highlights all matching canvas chips and left panel tree rows.

2. **Información Section (`design-libraries`):**
   - **External / Custom Icon Suites:** If an external or custom design system icon library (e.g. Octicons) is detected, render its name with its official documentation URL (e.g. `[Octicons](https://primer.style/octicons/)`) under `Información`.
   - **External Documentation Portal:** If an external human documentation website is found in the README/docs (e.g. `https://primer.style/`), render `Documentación externa: [URL]`.
   - **Internal Icons Only:** If icons are strictly local to the repository, do NOT render a duplicate external `Iconos:` line under `Información`.
