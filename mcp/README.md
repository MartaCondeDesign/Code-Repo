# Design System Analyzer MCP Server

An MCP (Model Context Protocol) server for high-speed, low-cost Design System contract analysis via the GitHub API.

## Workflow Pipeline

```text
1. GitHub API (`github_fetch_tree`)
   ↓ Fetches full repository file tree in 1 API call (fast & lightweight)

2. Analyzer Agent
   ↓ Evaluates tree structure & identifies key files needed

3. GitHub Reader (`github_fetch_files`)
   ↓ Fetches specific target files (package.json, README.md, index.ts)

4. Contract Rules Engine (`analyze_design_system`)
   ↓ Evaluates contracts (.md specifications):
     • contracts/detect-tokens.md
     • contracts/detect-styles.md
     • contracts/detect-component-inventory.md
     • contracts/detect-components.md
     • contracts/detect-icons.md (e.g. Octicons, Lucide, Tabler, internal SVGs)
     • contracts/detect-storybook.md

5. Project Guide Payload (`generate_project_guide`)
   ↓ Formats output metrics (capped at 200 items per category) and external documentation links
```

## Available MCP Tools

| Tool Name | Description |
|---|---|
| `github_fetch_tree` | Retrieves repository file tree via GitHub API (`/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`) |
| `github_fetch_files` | Retrieves contents for specific relative paths on demand |
| `analyze_design_system` | Applies contract rules against files and returns classified components, tokens, docs, and icon metadata |
| `generate_project_guide` | Formats final Project Guide metrics payload (with max 200 items capping per category) |

## Quick Start Configuration

Add to your MCP client configuration (`claude_desktop_config.json`, Antigravity `mcp_config.json`, or Cursor):

```json
{
  "mcpServers": {
    "design-system-analyzer": {
      "command": "node",
      "args": ["/Users/marta/Documents/Documentación/Clientes/Cmd/Code-Repo/mcp/server.mjs"]
    }
  }
}
```
