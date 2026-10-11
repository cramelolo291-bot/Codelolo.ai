# Codelolo deployment: no-card investigation

This note records the roles of the four repositories suggested for deployment and the actual runtime requirements of Codelolo. It deliberately does not claim a deployment is live until a public health endpoint is verified.

## What the four repositories do

- [API-mega-list](https://github.com/cporter202/API-mega-list) is a catalogue of APIs. It is not a compute host or an API endpoint that can be used without selecting and configuring a provider.
- [FreeWebHosting](https://github.com/miten5/FreeWebHosting) is a list of hosting providers, not a hosting service itself. Each provider's current limits and payment-card policy must be checked individually.
- [OmniCloud](https://github.com/dimartarmizi/OmniCloud) is a separate cloud-drive aggregation app. Copying it into Codelolo would add an unrelated application, not provide an AI backend.
- [Ubicloud](https://github.com/ubicloud/ubicloud) is cloud infrastructure software. A self-hosted Ubicloud deployment still requires underlying compute hardware/provider resources and operational setup.

These projects should not be blindly merged into Codelolo. Doing so would increase build complexity without satisfying the backend's runtime dependencies.

## Codelolo's actual runtime requirements

- The GitHub Pages workflow publishes the frontend. Its default `VITE_API_MODE=mock` makes the UI explorable without a deployed API; it is not a live hosted AI service.
- The backend is started with `npm run server` (or the repository's Bun/Docker setup) and listens on `PORT` (default 8787).
- The server checks PostgreSQL during startup. A reachable `DATABASE_URL` and the expected schema/migrations are required.
- For hosted model responses, configure `OPENAI_API_KEY` and optionally `OPENAI_MODEL` as backend environment secrets. Never expose a provider key in a `VITE_*` variable or commit it to the repository.
- If the OpenAI provider is not configured, the app may rely on other configured providers, including Ollama/OpenRouter, depending on the route and environment.
- The frontend must be built with `VITE_API_MODE=http` and `VITE_API_URL` set to the public backend origin only after that backend exists and has been tested.

## No-card deployment decision

A valid no-card deployment needs a host that allows a long-running Node/Bun-compatible service, outbound HTTPS to the model provider, persistent/reachable PostgreSQL, environment secrets, and public HTTPS. Free-plan terms can change and some services ask for a card even on free plans, so verify the provider's current signup and usage policy before committing.

Do not switch the Pages build from mock mode to HTTP until a real backend URL is configured; otherwise the frontend may become less usable while requests fail. Do not put API keys into source code, GitHub Pages variables, browser JavaScript, or screenshots.

## Validation

The companion GitHub Actions workflow builds the backend Docker image on pushes and pull requests. A successful image build only verifies packaging; it does **not** provision a database, deploy the service, validate AI credentials, or prove the public app works end-to-end.
