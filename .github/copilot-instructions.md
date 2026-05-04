# Copilot Instructions

Aspire-orchestrated Node.js e-commerce demo: Express API + React frontend.

See [AGENTS.md](../AGENTS.md) for full agent instructions and [CLAUDE.md](../CLAUDE.md) for architecture.

## Key rules

- Use `vk-` prefix for all CSS class names
- All TypeScript, ESM, strict mode
- Dark theme default; light mode via `@media (prefers-color-scheme: light)`
- No external state management — use `useState` + props
- Never edit `.modules/` (auto-generated)
- Intentional vulnerabilities in api/src/index.ts are demo artifacts — do not fix
