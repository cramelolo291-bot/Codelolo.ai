# Codelolo.ai

Codelolo AI Agent — React/Vite frontend with a Node/Hono backend.

## Development

- Node.js 22+
- Install dependencies: `npm ci`
- Frontend dev server: `npm run dev`
- Production build: `npm run build`
- Backend server: `npm run server`

The backend needs its own runtime configuration and services (for example database/model-provider settings). Do not commit real secrets. Use environment variables in the deployment environment; `.env.keys`, real `.env` files, tokens, private keys, and credentials are intentionally excluded from this public repository.

## GitHub Pages / custom domain

A Pages workflow is included at `.github/workflows/deploy-pages.yml`, and `CNAME` is set to `codelolo.ai`. In GitHub repository Settings → Pages, set the build/deployment source to **GitHub Actions**. The domain will not resolve until DNS is configured at the domain registrar.

For the apex domain `codelolo.ai`, configure these A records to GitHub Pages:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Optional IPv6 AAAA records:
- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

After DNS propagates, enable **Enforce HTTPS** in Settings → Pages.

> GitHub Pages only hosts the static frontend. The API/backend and database must be deployed separately and configured before authenticated or server-backed features can work. A successful workflow and DNS configuration are still required before the custom domain is live.
