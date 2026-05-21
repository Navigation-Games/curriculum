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
