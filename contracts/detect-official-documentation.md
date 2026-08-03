# Contrato: Detección Universal de Documentación Oficial Externa (`detect-official-documentation.md`)

## Objective

Find the official public documentation website for the Design System.

Do NOT return image URLs, badge URLs, repository assets, screenshots, SVGs, or decorative links as documentation.

---

## Critical Rule

```text
IMAGE URL ≠ DOCUMENTATION URL
BADGE URL ≠ DOCUMENTATION URL
REPOSITORY FILE ≠ DOCUMENTATION WEBSITE
```

### Example:

`https://img.shields.io/badge/Docs-astryx.atmeta.com-6741d9` is **NOT** documentation. It is a badge image.

A valid documentation URL should resolve to an actual documentation page or documentation website, for example:
`https://astryx.atmeta.com/docs/getting-started`

---

## Reject URLs from Asset/Image Services

Do **NOT** classify URLs as documentation when they point to:
- `img.shields.io`
- `.png`
- `.jpg`
- `.jpeg`
- `.gif`
- `.svg`
- `.webp`
- `.ico`
- Image CDNs
- Badge generators
- Screenshot services

Classify these as: `DOCUMENTATION_BADGE` or `IMAGE_ASSET`.  
**Never as: `OFFICIAL_DOCUMENTATION`**.

---

## Inspect Markdown and HTML Links Correctly

A `README.md` may contain linked badges:

```markdown
[![Docs](https://img.shields.io/badge/Docs-astryx.atmeta.com-purple)](https://astryx.atmeta.com/docs/getting-started)
```

There are **TWO** URLs here:
- **Badge image:** `https://img.shields.io/...` (REJECT)
- **Link destination:** `https://astryx.atmeta.com/docs/getting-started` (ACCEPT)

Always follow the **clickable link destination (`DESTINATION_URL` / `href`)**. Do NOT return the image source (`IMAGE_URL` / `src`).

### Markdown Rule

For this structure:
```text
[![label](IMAGE_URL)](DESTINATION_URL)
```
Interpret:
- `IMAGE_URL` → badge/image asset (reject)
- `DESTINATION_URL` → candidate official documentation URL (priority)

### HTML Equivalent

For:
```html
<a href="https://astryx.atmeta.com/docs/getting-started">
  <img src="https://img.shields.io/...">
</a>
```
Interpret:
- `img src` → image only (reject)
- `a href` → documentation candidate (accept)

Never confuse `src` with `href`.

---

## Where to Search & Priority

Prioritize searching in:
1. `README.md` links labelled:
   - `Docs`
   - `Documentation`
   - `Get started` / `Getting started`
   - `Website`
   - `Design System`
   - `Component docs`
2. `package.json` (`homepage`, `repository`, `documentation`)
3. Custom documentation metadata & configuration (`docusaurus.config.js`, `astro.config.mjs`, `next.config.js`)
4. GitHub repository About/Homepage URL
5. Documentation apps/directories (`apps/docsite`, `docs/`)
6. Storybook links

---

## Documentation Website Signals

A strong documentation URL usually:
- Uses `http` or `https`
- Points to an HTML website
- Has navigation or documentation routes such as `/docs`, `/getting-started`, `/components`, `/foundations`, `/guides`
- Or is the documentation domain root (e.g. `https://design.example.com`)

Supported documentation systems include Docusaurus, Storybook, Zeroheight, Supernova, GitBook, VitePress, Nextra, Astro, Next.js, and custom websites. (Do not require `/docs` to exist).

---

## Classification Levels

- **`OFFICIAL_DOCUMENTATION`**: Strong evidence that the URL is the official Design System documentation.
- **`DOCUMENTATION_CANDIDATE`**: Looks like documentation, but official status is uncertain.
- **`STORYBOOK`**: Component documentation hosted in Storybook.
- **`BADGE_IMAGE`**: Badge asset only (reject).
- **`IMAGE_ASSET`**: Image, screenshot, logo, SVG, etc. (reject).
- **`NOT_FOUND`**: No reliable documentation URL found.

---

## Required Output Structure

```yaml
DOCUMENTATION:
  Status: OFFICIAL_DOCUMENTATION
  Official URL: "https://astryx.atmeta.com/docs/getting-started"
  Evidence file: "README.md"
  Evidence: "Docs badge links to this destination."
  Rejected URL: "https://img.shields.io/badge/Docs-astryx.atmeta.com-..."
  Rejected reason: "Badge image, not documentation."
  Confidence: High
```

---

## Final Rule

When Markdown or HTML contains both an image and a link:
**FOLLOW THE LINK DESTINATION (`DESTINATION_URL`), NOT THE IMAGE SOURCE (`IMAGE_URL`)**.

And always validate:  
*Can this URL represent a navigable documentation website?*  
If the answer is no, do **not** classify it as official documentation.

---

### Caso Astryx

```text
BADGE
img.shields.io/...
→ descartar como documentación

DESTINATION / DOCS WEBSITE
astryx.atmeta.com/docs/getting-started
→ documentación oficial
```
