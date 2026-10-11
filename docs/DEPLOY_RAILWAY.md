# Deploy Codelolo backend to Railway

This repository now includes `railway.json` and a Dockerfile-based deployment.
This prepares the service; it does not create a Railway account, database, API
key, or public deployment by itself.

## Railway project setup

1. Create a Railway project from this GitHub repository and select the
   `main` branch. Railway will build the root `Dockerfile`.
2. Add a Railway PostgreSQL service to the same project.
3. In the Codelolo service variables, set:
   - `DATABASE_URL` to the Postgres service's `DATABASE_URL` reference.
   - `AUTO_MIGRATE=true` for the initial boot so the schema is applied.
   - `NODE_ENV=production`
   - `APP_URL` to the public Codelolo backend URL.
   - `OPENAI_API_KEY` to a valid provider key (store it as a secret; never
     commit it or put it in a Vite variable).
   - `OPENAI_MODEL=gpt-4.1-mini` (or a model enabled for the key).
4. Deploy and wait for the `/api/health` health check to pass. The server
   intentionally will not become healthy if PostgreSQL cannot be reached.
5. In GitHub repository **Settings → Secrets and variables → Actions → Variables**,
   set `VITE_API_URL` to the public backend URL and `VITE_API_MODE` to `http`.
   Rerun the Pages deployment workflow so the static frontend uses the real API.

## Important limits

- A successful GitHub Actions Docker build is not the same as a live backend.
- GitHub Pages only serves the frontend. It cannot run this server or host its
  PostgreSQL database.
- Railway account/billing requirements and free quotas can change. This config
  cannot bypass provider signup, usage limits, or payment verification.
- Without `OPENAI_API_KEY` or a reachable configured Ollama provider, AI
  generation cannot work. Never paste API keys into chat or commit them to Git.
