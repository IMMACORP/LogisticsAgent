R?t t?t ?
B?n ?? v??t qua phase kh? nh?t:

? UI ch?y ???c
? Architecture r?
? Folder structure t?t
? Multi-agent boundary ?? define

B?y gi? l? phase:

# ÅgAI Backend ImplementationÅh

?i?u QUAN TR?NG:

> ??ng prompt ki?u Ågimplement everythingÅh.

H?y ?i theo:

# Infrastructure First Å® Agent Runtime Å® Tools Å® Workflows

---

# OVERALL IMPLEMENTATION ROADMAP

M?nh recommend th? t? sau:

```text id="gl1"
1. Shared Contracts
2. Database Layer
3. Tool Layer
4. Agent Runtime
5. Reception Agent
6. Specialized Agents
7. Workflow Orchestration
8. Slack Escalation
9. Streaming API
10. Observability
```

---

# PHASE 1 ? DATABASE LAYER

??u ti?n ph?i thay mock data b?ng:

* Prisma
* PostgreSQL
* repositories

---

# STEP 1.1 ? Generate Prisma schema

## Cursor Prompt

```text id="gl2"
Read:
- @docs/05-schema-design.md
- @docs/01-system-architecture.md
- @AI_RULES.md

Generate:
- Prisma schema for:
  - conversations
  - messages
  - shipment
  - inventory
  - escalation_logs
  - audit_logs

Requirements:
- PostgreSQL optimized
- use pgvector extension placeholder
- proper indexes
- createdAt/updatedAt everywhere
- UUID primary keys
- snake_case db naming
```

---

# STEP 1.2 ? Generate repository layer

```text id="gl3"
Read:
- @packages/db/prisma/schema.prisma
- @AI_RULES.md

Generate:
- repository layer for:
  - ConversationRepository
  - ShipmentRepository
  - InventoryRepository
  - EscalationRepository

Requirements:
- repository pattern
- no business logic
- strict typing
- Prisma transaction support
```

---

# STEP 1.3 ? Seed data

```text id="gl4"
Generate Prisma seed scripts for:
- shipment data
- inventory data
- sample conversations

Requirements:
- realistic logistics data
- Japanese logistics terminology
```

---

# PHASE 2 ? TOOL LAYER

??y l? phase c?c k? quan tr?ng.

---

# DESIGN PRINCIPLE

Agent:

```text id="gl5"
THINKING ONLY
```

Tools:

```text id="gl6"
DETERMINISTIC EXECUTION
```

---

# STEP 2.1 ? Shipment tools

```text id="gl7"
Read:
- @docs/04-tool-specs.md
- @packages/shared-types
- @AI_RULES.md

Generate:
- getShipmentStatus tool
- searchShipmentHistory tool
- searchDeliveryIssue tool

Requirements:
- OpenAI Agents SDK compatible
- Zod validation
- typed responses
- repository access through service layer
- structured error handling
```

---

# STEP 2.2 ? Inventory tools

```text id="gl8"
Generate:
- searchInventory
- checkStockAvailability
- reserveInventory

Requirements:
- transactional safety
- inventory locking placeholder
- typed tool outputs
```

---

# STEP 2.3 ? Knowledge Base tools

```text id="gl9"
Generate:
- searchKnowledgeBase tool
- semantic search placeholder
- pgvector integration abstraction

Requirements:
- future-ready for RAG
- return citation metadata
- chunk structure support
```

---

# STEP 2.4 ? Slack tools

```text id="gl10"
Generate:
- notifySlack tool
- createEscalationMessage helper
- Slack webhook service

Requirements:
- retry support
- structured escalation payload
- environment variable config
- severity levels
```

---

# PHASE 3 ? AGENT RUNTIME

B?y gi? m?i b?t ??u AI layer ?

---

# STEP 3.1 ? OpenAI Agents SDK base

```text id="gl11"
Read:
- @docs/02-agent-responsibility.md
- @docs/01-system-architecture.md

Generate:
- OpenAI Agents SDK setup
- shared agent runtime abstraction
- base agent factory
- tool registration system

Requirements:
- modular agent registration
- reusable context object
- structured logging
- traceId propagation
```

---

# STEP 3.2 ? Reception Agent

??y l? MOST IMPORTANT.

---

## Reception Agent responsibilities

* intent classification
* slot collection
* delegation
* escalation decision

---

## Prompt

```text id="gl12"
Generate Reception Agent implementation.

Responsibilities:
- classify inquiry
- collect missing information
- route to specialized agents
- trigger escalation if confidence low

Supported agents:
- IT Support Agent
- HR Agent
- Logistics Agent

Requirements:
- OpenAI Agents SDK
- structured outputs
- zod schemas
- confidence scoring
- conversation memory support
```

---

# STEP 3.3 ? Logistics Agent

```text id="gl13"
Generate Logistics Operation Support Agent.

Capabilities:
- shipment inquiry
- inventory inquiry
- export request support
- delivery issue investigation

Available tools:
- getShipmentStatus
- searchInventory
- searchKnowledgeBase
- notifySlack

Requirements:
- tool-first architecture
- structured responses
- retry handling
- escalation support
```

---

# PHASE 4 ? WORKFLOW ORCHESTRATION

??y l? ph?n bi?n AI th?nh ÅgsystemÅh.

---

# STEP 4.1 ? Workflow engine

```text id="gl14"
Generate lightweight workflow orchestration layer.

Requirements:
- step execution
- retry policy
- timeout support
- compensation placeholder
- workflow state persistence

Example workflows:
- shipment inquiry
- escalation workflow
- inventory shortage workflow
```

---

# STEP 4.2 ? Escalation workflow

```text id="gl15"
Generate escalation workflow.

Trigger conditions:
- low confidence
- missing shipment data
- tool execution failure
- repeated retry failure

Workflow:
1. gather context
2. summarize conversation
3. create escalation payload
4. notify slack
5. persist escalation log

Requirements:
- audit logging
- idempotency
- structured escalation schema
```

---

# PHASE 5 ? API IMPLEMENTATION

---

# STEP 5.1 ? Streaming Chat API

```text id="gl16"
Generate chat streaming API using Hono.

Requirements:
- SSE streaming
- OpenAI Agents SDK integration
- session support
- conversation persistence
- error boundary
- traceId support
```

---

# STEP 5.2 ? Conversation API

```text id="gl17"
Generate REST APIs for:
- conversation history
- message history
- escalation history

Requirements:
- OpenAPI compatible
- Orval compatible
- pagination support
```

---

# PHASE 6 ? FRONTEND INTEGRATION

L?c n?y m?i connect th?t.

---

# STEP 6.1 ? Replace mock APIs

```text id="gl18"
Replace mock chat APIs with real streaming APIs.

Requirements:
- SSE support
- optimistic UI
- retry handling
- loading state
- error boundary
```

---

# STEP 6.2 ? Escalation UI

```text id="gl19"
Generate escalation status UI.

Features:
- escalation badge
- waiting for operator state
- retry indicator
- operator response timeline
```

---

# PHASE 7 ? OBSERVABILITY

AI systems kh?ng observability = ch?t ?

---

# STEP 7.1 ? Structured logging

```text id="gl20"
Generate structured logging system.

Requirements:
- traceId
- agent name
- tool execution logs
- latency tracking
- error categorization
```

---

# STEP 7.2 ? Audit logging

```text id="gl21"
Generate audit logging middleware.

Track:
- tool executions
- escalations
- agent routing decisions
- failures
```

---

# SI?U QUAN TR?NG:

# RULES KHI PROMPT CURSOR

---

# ? ??ng prompt:

```text id="gl22"
Implement logistics system
```

---

# ? H?y prompt:

```text id="gl23"
Generate ShipmentRepository only
```

---

# ? ??ng ?? AI t? ngh? architecture

---

# ? Lu?n include:

```text id="gl24"
Read:
- @AI_RULES.md
- @docs/...
```

---

# RECOMMEND TH?M

B?n n?n t?o th?m:

---

# 09-openai-agent-patterns.md

Define:

* agent lifecycle
* tool calling rules
* escalation rules
* confidence scoring

---

# 10-tool-contracts.md

Define:

* input/output
* retry policy
* timeout
* error schema

---

# 11-observability.md

Define:

* logging
* metrics
* traces
* audit

