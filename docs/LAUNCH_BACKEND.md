# Launch Codelolo backend

The GitHub Pages site is only the frontend. The full workspace needs a public backend and PostgreSQL. A successful Docker build is not a live backend.

## Lowest-cost setup

1. Create a PostgreSQL database on [Neon](https://neon.tech/). Neon documents a free tier with no credit card required; check its current limits before relying on it.
2. Choose a backend host that supports Docker and confirm its free tier does not require a payment card before creating a service. There is no universal no-card, always-on Docker host guarantee; many free services sleep, restrict compute, or change terms.
3. Deploy this repository using its `Dockerfile`. Configure the service to listen on the port supplied by the host (the app reads `PORT`).
4. Add these environment variables to the backend host's secret/environment settings:

   - `DATABASE_URL`: Neon PostgreSQL connection string (use the provider's pooled URL if recommended).
   - `AUTO_MIGRATE=true`: applies migrations at startup. For a more controlled production deployment, run migrations as a separate step and omit this.
   - `NODE_ENV=production`
   - `APP_URL`: the public frontend URL, currently `https://cramelolo291-bot.github.io/Codelolo.ai/`
   - `OPENAI_API_KEY`: optional; add only if you have a valid API key and understand that API usage is billed separately from ChatGPT.
   - `OPENAI_MODEL=gpt-4.1-mini`: optional model override.
   - `OPENROUTER_API_KEY`: optional alternative provider key.

   Do not put provider keys in `VITE_*` variables or commit them to GitHub.

5. Once the backend is deployed, set GitHub repository **Settings → Secrets and variables → Actions → Variables**:
   - `VITE_API_URL` = public backend origin, e.g. `https://your-backend.example` (no trailing slash)
   - `VITE_API_MODE` = `http`

   The GitHub Pages workflow will rebuild the frontend with the real backend URL.
6. Run **Actions → Backend smoke check → Run workflow**. It checks `/api/health` and fails if the backend/database is unhealthy.

## Important limitations

- A free Neon database alone does not host the backend.
- The backend uses PostgreSQL and also has local Ollama-related code paths. For hosted AI, configure OpenAI or OpenRouter on the backend; do not expect a cloud host to provide a local Ollama model automatically.
- A working deployment requires your own host account, database URL, and (for paid-provider AI) provider credentials. GitHub Actions cannot create these accounts or safely invent credentials.
- If you cannot add a card, do not enter one just to continue. Stop at any host's payment prompt and choose a genuinely cardless option instead.
