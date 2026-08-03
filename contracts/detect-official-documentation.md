# Critical Documentation URL Validation Contract (`detect-official-documentation.md`)

## Objective

Prevent image URLs, badge URLs, screenshots, logos, SVG assets, and other non-navigable resources from being classified as official Design System documentation.

The documentation detector must distinguish between:

- image source URLs
- badge URLs
- clickable link destinations
- actual documentation websites

---

## Critical rule

```text
IMAGE URL ≠ DOCUMENTATION URL
BADGE URL ≠ DOCUMENTATION URL
ASSET URL ≠ DOCUMENTATION URL

The detector must NEVER classify these as official documentation:

img.shields.io
badge image URLs
.png
.jpg
.jpeg
.gif
.svg
.webp
.ico
screenshots
logos
image CDN URLs
repository image assets

Example:

https://img.shields.io/badge/Docs-astryx.atmeta.com-6741d9?logo=readthedocs&logoColor=white

must always be classified as:

BADGE_IMAGE

and must NEVER be returned as:

OFFICIAL_DOCUMENTATION
```

---

## Markdown badges

When parsing Markdown like:

```markdown
[![Docs](https://img.shields.io/badge/Docs-example.com-purple)](
  https://example.com/docs/getting-started
)
```

there are **TWO** different URLs.

Interpret them as:

- `https://img.shields.io/...`  
  → **`IMAGE_SOURCE`**  
  → **REJECT** as documentation

- `https://example.com/docs/getting-started`  
  → **`LINK_DESTINATION`**  
  → documentation candidate

The clickable destination URL always has priority over the image URL.

### Markdown parsing rule

For:

```text
[![label](IMAGE_URL)](DESTINATION_URL)
```

classify:

- `IMAGE_URL` → `BADGE_IMAGE` or `IMAGE_ASSET` (reject)
- `DESTINATION_URL` → `DOCUMENTATION_CANDIDATE` (evaluate)

Never return `IMAGE_URL` as the official documentation URL.

---

## HTML parsing rule

For:

```html
<a href="https://example.com/docs/getting-started">
  <img src="https://img.shields.io/..." />
</a>
```

classify:

- `img src` → `IMAGE_ASSET` (reject)
- `a href` → `DOCUMENTATION_CANDIDATE` (evaluate)

Always prefer the `href` over the `src`.

---

## Hard rejection rules

Before evaluating documentation candidates, reject any URL when:

1. **Hostname is:** `img.shields.io` or another known badge/image service (`badges.gitter.im`, `coveralls.io`, `travis-ci.org`, `raw.githubusercontent.com`).
2. **URL path ends with:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.ico`.
3. **URL was extracted from:**
   - `<img src="">`
   - Markdown image syntax `![](...)`
   - badge image source
   - logo source
   - screenshot source

These URLs must be removed from the documentation candidate list before classification.

---

## Candidate selection

After rejecting image and badge URLs, prioritize actual navigable links whose context contains:

- `Docs`
- `Documentation`
- `Getting Started` / `Get Started`
- `Components`
- `Design System`
- `Component Library`
- `Guidelines`
- `Foundations`
- `Usage`

Possible valid documentation URLs include:
- `https://design.example.com`
- `https://design.example.com/docs`
- `https://design.example.com/docs/getting-started`
- `https://example.github.io/design-system/`
- `https://astryx.atmeta.com/docs/getting-started`

A documentation URL does NOT need to contain `/docs`, but it must represent a navigable website rather than an asset.

---

## Validation

Before returning a URL as `OFFICIAL_DOCUMENTATION`, verify:

1. It is an `http` or `https` link.
2. It is not an image or asset URL.
3. It is not a Shields.io badge.
4. It came from a clickable link destination, homepage, deployment configuration, package metadata, or other documentation reference.
5. Its context indicates documentation, Design System, components, guidelines, or getting started content.
6. If a badge contains both an image URL and a clickable destination, use the clickable destination.

---

## Classification

Use:

- **`OFFICIAL_DOCUMENTATION`**
- **`DOCUMENTATION_CANDIDATE`**
- **`STORYBOOK`**
- **`BADGE_IMAGE`**
- **`IMAGE_ASSET`**
- **`NOT_FOUND`**

`BADGE_IMAGE` and `IMAGE_ASSET` can **NEVER** become `OFFICIAL_DOCUMENTATION`.

---

## Required Output Structure

```yaml
DOCUMENTATION:
  Status: OFFICIAL_DOCUMENTATION # OFFICIAL_DOCUMENTATION | DOCUMENTATION_CANDIDATE | STORYBOOK | NOT_FOUND
  Official URL: "https://astryx.atmeta.com/docs/getting-started"
  Evidence file: "README.md"
  Evidence type: "Markdown link destination" # Markdown link destination | HTML href | package homepage | deployment config | other
  Rejected URLs:
    - "https://img.shields.io/badge/Docs-astryx.atmeta.com-6741d9?logo=readthedocs&logoColor=white"
  Rejected reason: "Badge image, not documentation."
  Confidence: High # High | Medium | Low
```

---

## Final Rule

**NEVER RETURN `img.shields.io` AS DOCUMENTATION.**

If the only URL found is a Shields.io badge or image asset:

```yaml
Official URL: NOT FOUND
```

**Do not infer the documentation URL from the text encoded inside the badge URL.**
