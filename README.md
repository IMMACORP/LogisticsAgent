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
- `npm run db:generate --workspace apps/backend` — generate Prisma Client (runs automatically before `dev` via `predev`)

### Prisma on Windows (SSL / corporate network)

If `prisma generate` fails with `unsafe legacy renegotiation disabled` or certificate revocation errors, from `apps/backend` run:

```bash
npm run db:generate
```

On Windows this uses `curl.exe --ssl-no-revoke` to download engines into `prisma/engines-cache/`, then runs `prisma generate`. You can also run `npm run db:engines:download` first.

### Local PostgreSQL (required for chat / history)

Chat streaming persists conversations to Postgres. If you see `Can't reach database server at localhost:5432`, start the database first.

**Docker (recommended)** — from the repo root, with [Docker Desktop](https://www.docker.com/products/docker-desktop/) running:

```bash
npm run db:up
npm run db:push --workspace apps/backend
npm run db:seed --workspace apps/backend
```

Or one shot: `npm run db:setup` (starts Postgres, applies schema, seeds demo data).

Default connection (matches `apps/backend/.env.example`):

```text
postgresql://postgres:postgres@localhost:5432/inquiry_agent
```

**Existing Postgres** — set `DATABASE_URL` in `apps/backend/.env` to your instance, then run `npm run db:push --workspace apps/backend`.

## Notes

The backend includes agent routing and a simple tools layer.
The frontend inquiry chat uses **`POST /chat/stream` (SSE)** from the browser. Set `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:3001`) in `apps/frontend/.env.local` with the backend running and `INQUIRY_USE_AGENTS_SDK=true`.

### OpenAI Agents SDK (backend)

When `INQUIRY_USE_AGENTS_SDK=true`, `POST /agent` runs the real OpenAI Agents SDK (`run`) with per-channel tools, structured JSON logs, and a request-scoped `AgentRunContext` (includes `traceId`, `sessionId`, `channel`). Set `OPENAI_API_KEY`. **If the key starts with `sk-proj-`, you must also set `OPENAI_PROJECT_ID=proj_...`** (same values as in your other working project). Optional: `OPENAI_ORG_ID`, `INQUIRY_AGENTS_MODEL`. Verify with `npm run check:openai --workspace apps/backend`. Clients may send `metadata.traceId` and `metadata.sessionId` to propagate correlation IDs.

**Reception channel (`channel: "reception"`):** uses a dedicated reception agent with **Zod structured `outputType`** (classification, `confidence`, `informationCompleteness`, `missingInformation`, routing action). **`metadata.sessionId`** (or the generated id in response `details`) keys an in-process **`MemorySession`** so follow-up turns stay in context until the process restarts. Optional tuning: `INQUIRY_RECEPTION_ROUTE_MIN_CONFIDENCE` (default `0.62`), `INQUIRY_RECEPTION_ESCALATE_MAX_CONFIDENCE` (default `0.42`), `INQUIRY_RECEPTION_ROUTE_MIN_COMPLETENESS` (default `0.45`), and `SLACK_ESCALATION_CHANNEL` for low-confidence / human-review Slack notifications.

### History REST APIs (OpenAPI / Orval)

Paginated list shape: `{ data: T[], pagination: { page, pageSize, total, totalPages } }`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | Conversation history (`userId` required; optional `status`, `currentAgent`) |
| GET | `/api/conversations/{conversationId}` | Single conversation |
| GET | `/api/conversations/{conversationId}/messages` | Messages in a thread |
| GET | `/api/messages` | Message history (`conversationId`, `userId`, `role` filters) |
| GET | `/api/escalations` | Escalation history (`conversationId`, `status`, `priority`, `category`) |
| GET | `/api/escalations/{escalationId}` | Single escalation log |

OpenAPI document: `GET /openapi.json` (live) or `packages/openapi/openapi.yaml`. Regenerate spec: `npm run openapi:generate --workspace apps/backend`. Orval: `npm run generate --workspace @inquiry-agent/openapi`.

Query: `page` (default 1), `pageSize` (default 20, max 100).

### Workflow orchestration (backend)

Lightweight step runner under `apps/backend/src/workflows/` with **retry**, **per-step timeout**, **compensation placeholders**, and **state persistence** (`workflow_runs` table; set `INQUIRY_WORKFLOW_STORE=memory` for in-process only).

- `POST /workflows/runs` — start a workflow (`workflowKey`, `initialState`, optional `traceId`)
- `GET /workflows/runs/:runId` — load persisted run
- `GET /workflows` — list keys

Built-in workflows: `shipment_inquiry`, `escalation`, `inventory_shortage`. Run `npx prisma migrate deploy` (or `db push`) after pulling schema changes.

**Escalation workflow (`workflowKey: "escalation"`, v2)** — five steps: gather context → summarize conversation → create structured payload → notify Slack → persist escalation log. **Triggers** (must match context): `low_confidence`, `missing_shipment_data`, `tool_execution_failure`, `repeated_retry_failure`. **Idempotency** via `input.idempotencyKey` (stored on `escalation_logs.metadata`; replays skip Slack/log writes). **Audit** events written to `audit_logs` per step. POST body:

```json
{
  "workflowKey": "escalation",
  "input": {
    "idempotencyKey": "trace-abc:low_confidence",
    "sessionId": "sess-1",
    "triggers": ["low_confidence"],
    "context": {
      "confidence": 0.35,
      "lastUserMessage": "Where is my shipment?",
      "channel": "logistics"
    }
  },
  "traceId": "optional-trace"
}
```

Programmatic entry: `startEscalationWorkflow(input)` from `@/workflows`.

### Chat streaming API (SSE)

`POST /chat/stream` returns **Server-Sent Events** when `INQUIRY_USE_AGENTS_SDK=true` and `OPENAI_API_KEY` is set.

Request body:

```json
{
  "userId": "user-1",
  "channel": "reception",
  "message": "配送状況を教えてください",
  "sessionId": "optional-sdk-session-id",
  "conversationId": "optional-uuid",
  "traceId": "optional-correlation-id"
}
```

SSE events: `meta` (traceId, sessionId, conversationId) → `delta` (text chunks) → optional `agent_update` / `tool` → `done` or `error`. User/assistant messages are persisted to `conversations` / `messages`. SDK **`MemorySession`** is keyed by `channel:sessionId` for multi-turn memory.

**Logistics channel (`channel: "logistics"`):** **Logistics Operation Support** agent with tool-first instructions and **Zod structured `outputType`** (`inquiryKind`, `toolsUsed`, `findingsSummary`, `userFacingAnswer`, `confidence`, `needsEscalation`, `suggestedNextSteps`). Tools are limited to **`getShipmentStatus`**, **`searchInventory`**, **`searchKnowledgeBase`**, **`notifySlack`**. Uses **`MemorySession`** keyed by `sessionId` for multi-turn threads. Retries transient SDK/network errors (`INQUIRY_LOGISTICS_RUN_MAX_ATTEMPTS`, default `3`; `INQUIRY_LOGISTICS_RETRY_BASE_DELAY_MS`, default `800`). Programmatic Slack escalation when `needsEscalation` or `confidence` ≤ `INQUIRY_LOGISTICS_ESCALATE_MAX_CONFIDENCE` (default `0.4`) and the model did not already call `notifySlack`.
