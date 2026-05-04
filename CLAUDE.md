# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Start the full app (orchestrates both API and frontend)
```bash
npm run dev          # or: npm run aspire:start
```

### API service (runs on port 5000)
```bash
cd api && npm start  # tsx src/index.ts
```

### Frontend service (runs on port 5173, proxies /api to Express)
```bash
cd frontend && npm run dev
cd frontend && npm run build    # tsc + vite build to dist/
cd frontend && npm run lint
cd frontend && npm run preview
```

### Linting & TypeScript
```bash
npm run lint         # lint apphost.ts
npm run watch        # watch-mode tsc for apphost.ts
```

There are no automated tests in this project.

## Architecture

This is a **Node.js Aspire app** — two microservices orchestrated by [apphost.ts](apphost.ts) using the Aspire SDK.

### Services

| Service | Path | Description |
|---------|------|-------------|
| API | [api/src/index.ts](api/src/index.ts) | Express 5 server with in-memory e-commerce data |
| Frontend | [frontend/src/App.tsx](frontend/src/App.tsx) | React 19 + Vite SPA (single component) |

**Aspire orchestration** ([apphost.ts](apphost.ts)) registers both services, wires the API HTTP endpoint, waits for API startup before frontend, and bundles the frontend `dist/` into the API container for production deployment.

### API Endpoints
- `GET /api/products` — product listing
- `POST /api/orders` — place order
- `PUT /api/products/:id` — update product (admin password required)
- `POST /api/reset-demo` — reset in-memory data (admin password required)
- `POST /api/logs` — frontend log forwarding
- `GET /health` — health check
- `GET /api/docs` — Swagger UI

### Observability
The API is instrumented with OpenTelemetry ([api/src/instrumentation.ts](api/src/instrumentation.ts)), exporting traces/metrics/logs to the Aspire dashboard. The frontend forwards its logs to `/api/logs`. OTLP endpoints are configured in [aspire.config.json](aspire.config.json) per launch profile (`https` on port 17084, `http` on port 15222).

### Dev vs Production
In dev, Vite proxies `/api` to `localhost:5000`. In production, the API serves the pre-built frontend static files from `dist/` (bundled via `publishWithContainerFiles` in apphost.ts).

### Data
All e-commerce data (products, orders) is **in-memory** in `api/src/index.ts` — resets on server restart or via `POST /api/reset-demo`.

### Intentional Demo Issues
The codebase intentionally includes examples of null pointer dereferences, memory leaks, and security vulnerabilities for demonstration purposes. Do not treat these as bugs to fix unless explicitly asked.
