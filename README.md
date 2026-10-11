# Codelolo.ai

Public repository for the Codelolo / Lolo AI Agent project.

## Project layout

- `src/` — React + Vite web application
- `server/` — API server, authentication, database, model routing, and pipeline modules
- `web-ui/` — browser automation / agent UI
- `scripts/` — project test and validation scripts
- `docs/` — environment and infrastructure notes

## Run locally

Requires Node.js 22+ and npm.

```bash
npm ci
npm run dev
```

Build the web app:

```bash
npm run build
```

Run the API server separately with `npm run server`. Configure required environment variables using the documented examples before enabling server/database features.

## Deployment

The repository includes a GitHub Actions workflow for GitHub Pages and a `CNAME` file for `codelolo.ai`. The custom domain is live only after GitHub Pages deployment succeeds and the domain's DNS records point to GitHub Pages.

## Security and migration

This repository is public. Secret files such as `.env.keys`, actual `.env` files, and credential-bearing files are intentionally excluded. Do not commit API keys, tokens, private keys, database passwords, or production environment files. Use GitHub Actions secrets or a private deployment environment for credentials.

Large unrelated vendor/source trees were left out of this public migration to keep the repository focused on the application and avoid copying unnecessary bundled code.
