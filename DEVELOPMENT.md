# Development Notes

Technical details for working on the site itself (build tooling, config, troubleshooting). For content editing and publishing, see [README.md](README.md).

## Docusaurus Config

The site config lives in `site/docusaurus.config.ts`.

### Faster Bundler (disabled)

Docusaurus v3 supports an optional Rust-based bundler (rspack) via `@docusaurus/faster`. It's enabled by adding this to the config:

```ts
future: {
  v4: true,
},
```

We removed this because rspack requires platform-specific native binaries, and they don't work when running Node from WSL against the Windows filesystem (`/mnt/c/...`). The standard webpack bundler works fine for our purposes. If the project moves to native Linux or macOS development, this could be re-enabled for faster builds.

## WSL Notes

If you're running `npm start` from WSL on a Windows machine, run `npm install` from the same environment (WSL) where you'll run the dev server. Native bindings installed on Windows won't work in WSL and vice versa.

If you hit native module errors after switching environments, delete `node_modules` and `package-lock.json` and reinstall:

```bash
cd site
rm -rf node_modules package-lock.json
npm install
```

## Build Commands

All commands run from the `site/` directory.

- `npm start` - dev server with hot reload (http://localhost:3000/curriculum/)
- `npm run build` - production build to `site/build/`
- `npm run serve` - serve the production build locally (useful for testing the final output)

## Deployment

Production deploys are handled by GitHub Actions (`.github/workflows/deploy.yml`). Every push to `main` triggers a build and deploy to GitHub Pages.

The workflow uses the modern "deploy from Actions" approach (`actions/deploy-pages`), not the older `gh-pages` branch method. This means:
- No `gh-pages` branch in the repo
- No deploy tokens or `GIT_USER` env vars needed
- Repo Settings > Pages must be set to source "GitHub Actions"

To deploy manually (if Actions is broken), you can still use:

```bash
cd site
GIT_USER=<your-github-username> npm run deploy
```

This falls back to the `docusaurus deploy` command, which pushes a build to a `gh-pages` branch.

## GitHub URLs

The GitHub org is `Navigation-Games` (with a hyphen, capital letters). Make sure URLs reference this consistently:
- Repo: `https://github.com/Navigation-Games/curriculum`
- Pages: `https://navigation-games.github.io/curriculum/`


## Content Build System

The build script (`scripts/build-content.js`) converts clean Markdown content files into MDX pages with React components. Editors work with the content files; the generated MDX is committed alongside them.

### How it works

1. Reads `.md` files from `content/activities/` and `content/lessons/grade-3-5/`
2. Parses the `# Title`, YAML frontmatter, and `## Section` blocks
3. Validates required fields and sections (reports errors/warnings)
4. Generates MDX with the correct imports, components, and dual-view wrapping
5. Writes to `site/docs/activities/core/` and `site/docs/lessons/grade-3-5/`

### Dual-view rendering

Every generated page wraps content in `<FullOnly>` and `<CompactOnly>` blocks. The URL parameter `?view=compact` toggles between them. The `<ViewToggle>` component renders a button to switch views.

- **Full view**: renders markdown directly (headings, tables, links, activity cards)
- **Compact view**: renders a `<OnePager>` component with structured props (goals as an array, delivery as JSX, etc.)

### Activity generation

Activities use tabs (`<Tabs>` / `<TabItem>`) for Learning Goals, How to Run It, Script, Vocabulary, and Companions. Images float right. Videos render below the tabs.

The `Short:` / `Long:` goal format lets the build script send short text to the one-pager and long text to the full page.

The `## Delivery` section is converted from markdown numbered/lettered lists to JSX (`<ol>/<li>`) for the one-pager. Markdown links are stripped (they don't work inside JSX props) and `**bold**` is converted to `<strong>`.

### Lesson generation

Lessons are simpler: no tabs, no companions, no script. The full view passes delivery markdown through directly (links work in markdown context). The compact view converts delivery to JSX like activities do.

If the content file has a `## Compact Delivery` section, it overrides the delivery shown on the one-pager. This lets authors write a simplified version for printing.

### Validation

The build script checks for common problems and exits with code 1 on errors:

**Errors (build fails):**
- Missing title (no `# Heading` at top)
- Missing `tagline` in frontmatter
- Missing required sections (`## Description`, `## Goals` for activities; `## Goals`, `## Delivery` for lessons)
- Empty goals section

**Warnings (build succeeds):**
- Missing `time`, `space`, `sidebar_position`
- Missing `## Steps`, `## Delivery`, or vocabulary for activities


## React Components

These components are used in the generated MDX. You don't need to know them to edit content, but they're documented here for reference.

### ViewToggle / FullOnly / CompactOnly

`site/src/components/ViewToggle/index.tsx`

Provides view switching. `useIsCompact()` reads the `?view=compact` URL parameter. `<FullOnly>` and `<CompactOnly>` conditionally render their children.

### OnePager

`site/src/components/OnePager/index.tsx`

Renders the compact/printable view. Props:

| Prop | Type | Description |
|---|---|---|
| `title` | string | Page title |
| `tagline` | string | One-line summary |
| `variant` | `'activity'` or `'lesson'` | Lessons get a green border and label |
| `epigraph` | string | Quote shown at top |
| `description` | string | Activity description (activities only) |
| `image` | string | Image path for one-pager |
| `time` | string | Duration |
| `space` | string | Space needed |
| `materials` | string[] | Materials list |
| `setup` | string | Setup instructions |
| `vocabulary` | string[] | Vocabulary terms |
| `goals` | string[] | Learning goals (short form) |
| `delivery` | JSX | Delivery steps as JSX |
| `reflection` | string[] | Reflection questions |
| `extensions` | string[] | Extension activities |

### ActivityCard

`site/src/components/ActivityCard/index.tsx`

Clickable card with optional image and colored tag. Used in lesson plans to link to activities.

| Prop | Required | Description |
|---|---|---|
| `title` | yes | Activity name |
| `description` | yes | One-line summary |
| `link` | no | URL to link to |
| `image` | no | Thumbnail image path |
| `tag` | no | Colored label: `core`, `readiness`, `variation`, `extension` |

### CardGrid

`site/src/components/CardGrid/index.tsx`

Responsive grid container. Reflows on smaller screens.

| Prop | Default | Description |
|---|---|---|
| `columns` | `3` | Columns on desktop (2, 3, or 4) |

### YouTube

`site/src/components/YouTube/index.tsx`

Responsive 16:9 video embed.

| Prop | Required | Description |
|---|---|---|
| `id` | yes | YouTube video ID |
| `title` | no | Accessible iframe title |

### ActivityMeta

`site/src/components/ActivityMeta/index.tsx`

Renders the time/space/materials/vocabulary summary bar on activity pages.

### MaterialLink

`site/src/components/MaterialLink/`

Clickable material name that opens a popup with details (description, where to get, alternatives, learning connection). Links to the full materials index.

Uses a **React Portal** (`createPortal` into `document.body`) so the popup is not clipped by ancestor elements with `overflow: hidden` (e.g. table cells). The popup is positioned using `getBoundingClientRect()` with viewport clamping to prevent edge overflow. This approach was chosen over Floating UI (would add a dependency) and the HTML Popover API (newer browser support, SSR complications).

Material data lives in `materialsData.ts` with keyword-based fuzzy matching so variant names in content files ("4 colored landmark cones", "4 colored cones (red, blue, green, yellow)") resolve to the same entry.

### VocabLink

`site/src/components/VocabLink/`

Clickable vocabulary term that opens a popup with the glossary definition. Links to the full glossary page. Uses the same `PopoverPortal` as MaterialLink.

Glossary data lives in `glossaryData.ts`, mirroring the content of `site/docs/reference/glossary.md`. Lookup is case-insensitive with substring fallback for variant phrasings.

### PopoverPortal

`site/src/components/PopoverPortal/`

Shared portal-based popup used by MaterialLink and VocabLink. Renders into `document.body` via `createPortal` so popups are never clipped by ancestor overflow. Positions using `getBoundingClientRect()` with above/below flipping and viewport edge clamping. Accepts a `width` prop (default 320px).

### Description

`site/src/components/Description/index.tsx`

Renders the activity description text.
