# Detect Storybook

## Objective

Determine whether a repository has an officially published Storybook and, if so, locate its public URL.

The main task is to answer:

**Does this repository have a deployed, publicly accessible Storybook — and where?**

The presence of `.stories.*` files or a `.storybook/` configuration directory alone is NOT sufficient evidence. A real Storybook deployment requires confirmed evidence of a public URL.

---

# Main rule

```text
STORIES ≠ STORYBOOK DEPLOYMENT
```

A file ending in `.stories.tsx` means there are story files.
A `.storybook/` folder means there is local Storybook configuration.
Neither of those proves there is a deployed Storybook accessible at a URL.

---

# What you must find

A confirmed public Storybook URL in one of these forms:

```text
https://<project>.chromatic.com
https://<org>.github.io/<repo>/
https://<subdomain>.netlify.app
https://<subdomain>.vercel.app
https://storybook.<domain>.com
https://<any-domain>/storybook/
```

If you cannot find a public URL, the result is:

```text
Classification: NO_STORYBOOK_FOUND
```

---

# Signal hierarchy

Evaluate signals in this order. Stop at the first confirmed match.

## 1. STORIES — story files exist

Files ending in:

```text
.stories.tsx
.stories.ts
.stories.jsx
.stories.js
.stories.mdx
```

This alone classifies as `STORIES_ONLY`. Continue searching for more signals.

## 2. CONFIG — local Storybook configuration exists

Presence of:

```text
.storybook/
.storybook/main.js
.storybook/main.ts
.storybook/config.js
```

This alone classifies as `LOCAL_STORYBOOK_ONLY`. Continue searching for more signals.

## 3. DEPLOYMENT — deployment configuration found

Presence of:

```text
.github/workflows/chromatic.yml
.github/workflows/storybook.yml
netlify.toml referencing storybook
vercel.json referencing storybook
package.json scripts with "build-storybook" or "deploy-storybook"
```

This alone classifies as `STORYBOOK_DEPLOYMENT_FOUND`. Continue searching for the URL.

## 4. EVIDENCE — public URL confirmed

A URL found in:

- `README.md`
- `CONTRIBUTING.md`
- `docs/` markdown files
- `package.json` (homepage, repository, or scripts fields)
- `.github/workflows/` (deployment step output)
- Any file with a link matching the URL patterns above

This is the only signal that upgrades the classification to `OFFICIAL_STORYBOOK`.

---

# Classifications

| Classification | Meaning |
|---|---|
| `OFFICIAL_STORYBOOK` | Story files + config + deployment + confirmed public URL |
| `STORYBOOK_DEPLOYMENT_FOUND` | Story files + config + deployment evidence, but no confirmed URL |
| `LOCAL_STORYBOOK_ONLY` | Story files + local config, no deployment evidence |
| `STORIES_ONLY` | Story files found, no config, no deployment |
| `NO_STORYBOOK_FOUND` | No story files, no config, no deployment |

---

# URL extraction rules

When scanning for the Storybook URL, look for:

```text
https://[^\s)>"'\]]*(?:
  storybook\.[^\s)>"'\]]+
  | chromatic\.com\/[^\s)>"'\]]+
  | \.github\.io\/[^\s)>"'\]]*storybook[^\s)>"'\]]*
  | [^\s)>"'\]]*\.(?:netlify|vercel)\.app[^\s)>"'\]]*
)
```

Strip trailing punctuation from matched URLs:

```text
[,.)]+$
```

If the URL also matches the Docs pattern (e.g. a `.github.io` site), prefer the Storybook classification only if the URL path contains `storybook` or the domain is clearly a Storybook deployment.

---

# Deprecation rule

Even if a public URL is found, **do NOT return it** if the README or docs signal that the Storybook is deprecated, archived, discontinued, or no longer maintained.

Deprecation signals (within ~60 characters of the word "storybook"):

```text
deprecated ... storybook
storybook ... deprecated
archived storybook
storybook is no longer
legacy storybook
storybook ... discontinued
storybook ... obsolete
```

If any of these patterns match, treat the result as:

```text
Classification: LOCAL_STORYBOOK_ONLY (or STORIES_ONLY)
storybookUrl: null
```

A deprecated Storybook — even if it has a public URL — is not a valid active deployment.

---

# What is NOT a Storybook URL

Do not return as `storybookUrl`:

- `https://storybook.js.org` — this is the Storybook tool homepage, not the project's deployed Storybook
- Generic documentation sites without evidence of Storybook content
- Local URLs (`localhost`, `127.0.0.1`)
- Private URLs requiring authentication

---

# DS node map tags

| Field | Values |
|---|---|
| `node.tag` | `"story"` |
| `node.layer` | `"stories"` |

Files in these nodes are story files. Their presence contributes to `STORIES_ONLY` or higher, but never to `OFFICIAL_STORYBOOK` unless a public URL is also found.

---

# Display rule

**Only show the Storybook link in the project guide if `storybookUrl` is found.**

If the classification is `LOCAL_STORYBOOK_ONLY`, `STORIES_ONLY`, or `NO_STORYBOOK_FOUND`, do not render a Storybook link. Do not fall back to `https://storybook.js.org`.

```text
storybookUrl found  →  show "Storybook: [link]"
storybookUrl null   →  do not show Storybook section
```

---

# Required output

```text
STORYBOOK DETECTION

Classification:
<OFFICIAL_STORYBOOK | STORYBOOK_DEPLOYMENT_FOUND | LOCAL_STORYBOOK_ONLY | STORIES_ONLY | NO_STORYBOOK_FOUND>

Story files found:
<count or 0>

Config folder:
<.storybook/ present | not found>

Deployment evidence:
<file path or none>

Public URL:
<url or null>
```

---

# Final rule

Before returning a Storybook URL, confirm:

> Is this URL a deployed, public Storybook specific to this repository — not the Storybook tool homepage?

If not:

```text
storybookUrl: null
```

And remember:

```text
STORY FILES ≠ DEPLOYED STORYBOOK
LOCAL CONFIG ≠ PUBLISHED STORYBOOK
PUBLIC URL = the only evidence that counts for display
```
