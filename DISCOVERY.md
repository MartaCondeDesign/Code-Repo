# Repository discovery

Do not assume a fixed folder structure.

Before making UI changes, inspect the repository and identify where these resources live:

- Design tokens
- Global styles and themes
- Icons
- Illustrations
- UI components
- Design patterns
- Product pages or features
- Documentation

Search using:

- Folder names
- File names
- Imports
- `package.json`
- Lockfiles
- Theme configuration
- CSS variables
- Existing component usage

Common locations may include:

- `src/components/`
- `src/ui/`
- `src/design-system/`
- `src/styles/`
- `src/tokens/`
- `src/assets/`
- `shared/`
- `packages/`
- `apps/`
- `docs/`

These are examples only. Do not assume they exist.

If a resource is not found in the expected location, search the whole repository by name, import path, or usage before concluding that it does not exist.

Always follow the repository's existing structure and conventions.
