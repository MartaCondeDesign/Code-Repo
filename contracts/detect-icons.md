# Detect Design System Icon Source and Inventory (v2)

## Objective

Analyze a repository to determine how the Design System provides icons and locate any external human documentation websites.

The detector answers:

1. Does the Design System have icons?
2. Are icons stored internally in the repository (SVG files, icon components)?
3. Are icons provided by an external icon library (Lucide, Tabler, Heroicons, FontAwesome, etc.)?
4. Is the icon set referenced in `README.md` or markdown documentation?
5. Is there an external human documentation website (Zeroheight, Supernova, custom `https://ds.company.com`) explaining the design system?
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
B. EXTERNAL ICON LIBRARY (Open-source package or external icon repository)
C. MIXED SOURCE (Local SVG files + External library)
```

---

# Detection Workflow

1. **Package manifest & Code scanning:**
   Scan `package.json` dependencies and source code imports for known icon packages (`lucide-react`, `@tabler/icons-react`, `@heroicons/react`, `font-awesome`, `@phosphor-icons/react`, `@radix-ui/react-icons`, etc.).

2. **README & Documentation scanning:**
   Scan `README.md` and documentation markdown files (`.md`, `.mdx`) for explicit references to icon libraries as well as external human documentation site URLs (e.g. Zeroheight, Supernova, custom DS doc portals).

3. **SVG & Icon Component scanning:**
   Scan `.svg` files in the repository while excluding non-icon assets (`logo`, `illustration`, `marketing`, `banner`, `hero`, `favicon`, `screenshot`, `artwork`). Valid vector SVG files and icon components belong to `internalIconFiles`.

---

# What the Project Guide needs

1. **Icons Metric Card (`design-metrics`):**
   - Displays `design.dsIconFiles` — the exact count of files in the project/canvas referencing icons.
   - Clicking on the Icons card highlights all matching canvas chips and left panel tree rows.

2. **Información Section (`design-libraries`):**
   - **External Icons / External Repos:** If an external open-source icon library or external icon repository is detected, render its name with a direct clickable URL under `Información`.
   - **External Documentation Portal:** If an external human documentation website is found in the README/docs, render `Documentación externa: [URL]`.
   - **Internal Icons Only:** If icons are strictly local to the repository, do NOT render a duplicate external `Iconos:` line under `Información`.
