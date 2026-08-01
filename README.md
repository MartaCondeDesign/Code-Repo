# Code Repo

**Your code repository explained in design language.**

Code Repo maps any public GitHub repository as a visual diagram. It translates technical structure — files, layers, dependencies — into concepts familiar to product designers: what each part is, what it does, and how pieces connect.

![Code Repo screenshot](https://raw.githubusercontent.com/MartaCondeDesign/code-repo/main/public/screenshot.png)

## Features

- **Visual map** — interactive diagram of the repository's architecture organized by layer (Docs, Foundation, UI, Application)
- **File tree** — explore the full file hierarchy with search and folder navigation
- **Inspector panel** — select any node to read plain-language explanations of what it is and what it does
- **Alternate explanations** — request up to 3 alternative ways to understand each part
- **Project Guide** — floating assistant with an overview of design-system metrics (components, tokens, stories, patterns, layouts)
- **Accessibility** — dyslexia-friendly font, high contrast, warm background, and reading focus mode
- **Spanish / English** — switch languages at any time

## Getting started

### Requirements

- Node.js 18+
- A GitHub personal access token is **not required** — the analyzer clones public repositories via HTTPS

### Run locally

```bash
npm install
npm run dev
```

The app opens at `http://localhost:4311`.

The repository analyzer runs as a separate server:

```bash
node server/index.mjs
```

The Vite dev server proxies `/api` calls to `http://localhost:4314`.

### Build

```bash
npm run build
```

Output goes to `dist/`. The frontend is a static Vite + React app. The `server/` directory contains a lightweight Node.js API that clones and analyzes any public GitHub repository.

## Project structure

```
src/
  App.jsx          Main layout, resize logic, language switch
  ProjectGuide.jsx Floating guide popup with design metrics
  ChipNode.jsx     Node card in the visual map
  LaneNode.jsx     Layer container in the visual map
  LabeledEdge.jsx  Connection label between nodes
  RepoTree.jsx     File tree panel
  ChatWidget.jsx   In-app assistant chat
  map.css          All styles and design tokens
  map-data.js      Text helpers (what/does/sub per language)
  layout.js        Auto-layout engine for the visual map
server/
  index.mjs        HTTP API server (POST /api/analyze)
  analyze.mjs      Repository analysis and map generation
```

## Design decisions

See [`design.md`](design.md) for the visual system rules: typography, meta labels, button styles, resize handles, and responsive behavior.

## License

MIT
