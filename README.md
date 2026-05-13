# Inquiry Agent Monorepo

A TypeScript monorepo for an HR/IT/Logistics AI agent platform with:

- `Next.js 15` frontend
- `Hono` backend API server
- `OpenAI Agents SDK` integration
- `PostgreSQL` + `pgvector`
- `Slack` notification support
- Shared types and OpenAPI code generation with Orval

## Workspaces

- `apps/frontend`
- `apps/backend`
- `packages/shared-types`
- `packages/openapi`
- `packages/agents`

## Commands

- `npm install`
- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build:frontend`
- `npm run build:backend`

## Notes

The backend includes agent routing and a simple tools layer.
The frontend is a minimal Next.js shell that can call backend APIs.
