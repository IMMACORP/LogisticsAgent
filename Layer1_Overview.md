# Appication overall architect design

Prompt: Hãy build source base cho app với cấu trúc như sau:
## Overall architect

```mermaid
flowchart TD
%% Node definition

UI["Next.js: Frontend"]
HONO["Hono: API Server"]
AGENT["OpenAI Agents SDK"]
RA["Reception Agent"]

subgraph Specialized_Agent ["Specialized Agent"]
    direction LR
    SA1["HR / General Affairs Agent"]
    SA2["IT Support Agent"]
    SA3["Logistics Operation Support Agent"]
end
TOOLS["Tool Layer"]
DB[("PostgreSQL")]
NOTIFY["Slack"]

UI --> HONO
HONO --> AGENT
AGENT --> RA
RA --> SA1
RA --> SA2
RA --> SA3
SA1 --> TOOLS
SA2 --> TOOLS
SA3 --> TOOLS
TOOLS --> DB
SA1 --> NOTIFY
SA2 --> NOTIFY
SA3 --> NOTIFY

%% Styling (Optional)
style UI fill:#e1f5fe,stroke:#01579b
style RA fill:#b3e5fc,stroke:#01579b,font-weight:bold
style Specialized_Agent fill:#f1f8e9,stroke:#33691e,stroke-dasharray: 5 5
style SA1 fill:#c8e6c9,stroke:#2e7d32
style SA2 fill:#c8e6c9,stroke:#2e7d32
style SA3 fill:#c8e6c9,stroke:#2e7d32
style TOOLS fill:#d1c4e9,stroke:#4527a0
style DB fill:#ffe0b2,stroke:#e65100
```

## Techstack
### Frontend
| Component  | Tech            |
| ---------- | --------------- |
| Framework  | Next.js 15      |
| Language   | TypeScript 5.6  |
| UI         | TailwindCSS     |
| API client | Orval generated |

### Backend

| Component            | Tech           |
| -------------------- | -------------- |
| Runtime              | Node.js 22 LTS |
| Framework            | Hono 4.5       |
| Language             | TypeScript 5.6 |
| Validation           | Zod            |
| API Spec             | OpenAPI 3.1    |
| API Client Generator | Orval          |

### AI Layer
| Component | Tech              |
| --------- | ----------------- |
| SDK       | OpenAI Agents SDK |
| LLM       | GPT-4.1-mini      |

### Database

| Purpose        | Tech          |
| -------------- | ------------- |
| Operational DB | PostgreSQL 16 |
| Cache          | built-in      |
| Vector Search  | pgvector      |

### Notification
| Purpose | Tech      |
| ------- | --------- |
| ChatOps | Slack API |

## Folder structure

project-root/

apps/
 ├── frontend/
 └── backend/

packages/
 ├── shared-types/
 ├── openapi/
 └── agents/

apps/backend/src/

 ├── routes/
 ├── agents/
 │    ├── reception/
 │    ├── hr/
 │    ├── it/
 │    └── accounting/
 │
 ├── tools/
 ├── services/
 ├── schemas/
 └── db/