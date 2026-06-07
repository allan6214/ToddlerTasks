# Toddler Tasks

Routine dashboard app built with React + Vite.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Output is generated in `dist/`.

## Deploy to GitHub Pages

This repo includes a workflow at `.github/workflows/deploy-pages.yml` that builds and deploys automatically.

1. Push the project to a GitHub repository.
2. Ensure your default branch is `main`.
3. In GitHub, open `Settings -> Pages`.
4. Under `Build and deployment`, choose `GitHub Actions` as the source.
5. Push to `main` (or run the workflow manually from the Actions tab).
6. Open the published Pages URL shown in the deploy job output.

## Install on iPad

1. Open the GitHub Pages URL in Safari on iPad.
2. Tap `Share`.
3. Tap `Add to Home Screen`.
4. Launch from the home screen for standalone app mode.

## PWA support

The app is configured with `vite-plugin-pwa` and generates:

- `dist/manifest.webmanifest`
- `dist/sw.js`

This enables offline caching and app-like installation behavior where supported.
