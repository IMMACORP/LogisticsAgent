# PostgreSQL Database Design

## Main Tables

| Table                 | Purpose                         |
| --------------------- | ------------------------------- |
| conversations         | Store chat history              |
| conversation_sessions | Store chat session metadata     |
| incidents             | Store IT support incidents      |
| shipments             | Store shipment information      |
| inventory             | Store inventory information     |
| escalation_requests   | Store human escalation requests |
| users                 | Store user information          |

---

# 1. conversations

Store all conversation messages between users and agents.

---

## Table: conversations

| Column     | Type        | Description                             |
| ---------- | ----------- | --------------------------------------- |
| id         | uuid (PK)   | Message ID                              |
| session_id | uuid (FK)   | Conversation session                    |
| user_id    | varchar     | User ID                                 |
| role       | varchar     | user / assistant / agent / system       |
| agent_type | varchar     | reception / it_support / logistics / hr |
| message    | text        | Message content                         |
| intent     | varchar     | Classified intent                       |
| metadata   | jsonb       | Additional metadata                     |
| created_at | timestamptz | Created timestamp                       |

---

## Example metadata

```json
{
  "confidence": 0.92,
  "handoffAgent": "it_support",
  "language": "en"
}
```

---

## Recommended Indexes

```sql
CREATE INDEX idx_conversations_session_id
ON conversations(session_id);

CREATE INDEX idx_conversations_created_at
ON conversations(created_at);
```

---

# 2. conversation_sessions

Store session-level information.

---

## Table: conversation_sessions

| Column        | Type        | Description          |
| ------------- | ----------- | -------------------- |
| id            | uuid (PK)   | Session ID           |
| user_id       | varchar     | User ID              |
| status        | varchar     | active / closed      |
| current_agent | varchar     | Current active agent |
| summary       | text        | Conversation summary |
| created_at    | timestamptz | Created timestamp    |
| updated_at    | timestamptz | Updated timestamp    |

---

# 3. incidents

Store IT support incidents.

---

## Table: incidents

| Column           | Type        | Description                   |
| ---------------- | ----------- | ----------------------------- |
| id               | uuid (PK)   | Incident ID                   |
| session_id       | uuid        | Related session               |
| incident_no      | varchar     | Incident number               |
| category         | varchar     | VPN / laptop / SAP            |
| priority         | varchar     | low / medium / high           |
| status           | varchar     | open / in_progress / resolved |
| assigned_team    | varchar     | IT support team               |
| summary          | text        | Incident summary              |
| resolution       | text        | Resolution details            |
| created_by_agent | varchar     | Agent name                    |
| created_at       | timestamptz | Created timestamp             |
| resolved_at      | timestamptz | Resolved timestamp            |

---

# 4. shipments

Store shipment information.

---

## Table: shipments

| Column           | Type        | Description       |
| ---------------- | ----------- | ----------------- |
| id               | uuid (PK)   | Shipment ID       |
| tracking_number  | varchar     | Tracking number   |
| shipment_status  | varchar     | Shipment status   |
| origin           | varchar     | Origin            |
| destination      | varchar     | Destination       |
| current_location | varchar     | Current location  |
| eta              | timestamptz | Estimated arrival |
| delay_reason     | text        | Delay reason      |
| customer_name    | varchar     | Customer name     |
| updated_at       | timestamptz | Updated timestamp |

---

## Shipment Status Examples

```text
PENDING
IN_TRANSIT
DELAYED
DELIVERED
CANCELLED
```

---

# 5. inventory

Store warehouse inventory information.

---

## Table: inventory

| Column            | Type        | Description       |
| ----------------- | ----------- | ----------------- |
| id                | uuid (PK)   | Inventory ID      |
| warehouse_code    | varchar     | Warehouse code    |
| item_code         | varchar     | Item code         |
| item_name         | varchar     | Item name         |
| quantity          | integer     | Current quantity  |
| reserved_quantity | integer     | Reserved quantity |
| unit              | varchar     | Unit              |
| updated_at        | timestamptz | Updated timestamp |

---

# 6. escalation_requests

Store escalation requests to human operators.

---

## Table: escalation_requests

| Column            | Type        | Description                    |
| ----------------- | ----------- | ------------------------------ |
| id                | uuid (PK)   | Escalation ID                  |
| session_id        | uuid        | Related session                |
| category          | varchar     | escalation category            |
| priority          | varchar     | LOW / MEDIUM / HIGH            |
| escalation_reason | text        | Escalation reason              |
| assigned_team     | varchar     | Target team                    |
| slack_thread_ts   | varchar     | Slack thread ID                |
| status            | varchar     | open / acknowledged / resolved |
| created_at        | timestamptz | Created timestamp              |

---

# 8. users

Store user information.

---

## Table: users

| Column          | Type        | Description        |
| --------------- | ----------- | ------------------ |
| id              | uuid (PK)   | User ID            |
| employee_no     | varchar     | Employee number    |
| name            | varchar     | User name          |
| email           | varchar     | Email              |
| department      | varchar     | Department         |
| office_location | varchar     | Office             |
| language        | varchar     | Preferred language |
| created_at      | timestamptz | Created timestamp  |

---

# 9. Table: knowledge_documents

Store enterprise knowledge base documents used by Specialized Agents for:

* RAG (Retrieval-Augmented Generation)
* FAQ search
* Troubleshooting
* Company policy retrieval
* Operational procedures

---

# Purpose

The `knowledge_documents` table acts as the central knowledge repository for AI agents.

Examples:

* VPN troubleshooting guide
* SAP login manual
* Warehouse operation SOP
* HR leave policy
* Expense reimbursement rules

---

# Table Structure

| Column        | Type        | Description                    |
| ------------- | ----------- | ------------------------------ |
| id            | uuid (PK)   | Document ID                    |
| document_code | varchar     | Unique document code           |
| title         | varchar     | Document title                 |
| category      | varchar     | Document category              |
| subcategory   | varchar     | Optional subcategory           |
| content       | text        | Main document content          |
| summary       | text        | AI-friendly summary            |
| keywords      | text[]      | Search keywords                |
| language      | varchar     | Document language              |
| source_type   | varchar     | manual / policy / faq / sop    |
| source_url    | text        | Original document URL          |
| file_name     | varchar     | Uploaded file name             |
| version       | integer     | Document version               |
| status        | varchar     | active / archived / draft      |
| access_level  | varchar     | public / internal / restricted |
| created_by    | varchar     | Creator ID                     |
| updated_by    | varchar     | Last updater ID                |
| created_at    | timestamptz | Created timestamp              |
| updated_at    | timestamptz | Updated timestamp              |

---

# Example Record

```json id="l0s5lt"
{
  "document_code": "IT-VPN-001",
  "title": "VPN Connection Troubleshooting Guide",
  "category": "it_support",
  "subcategory": "vpn",
  "content": "If VPN connection fails, first verify office location settings...",
  "summary": "VPN troubleshooting steps for employees",
  "keywords": [
    "vpn",
    "connection",
    "tokyo office",
    "network"
  ],
  "language": "en",
  "source_type": "manual",
  "status": "active",
  "access_level": "internal"
}
```

---

# Recommended Categories

| Category   | Example              |
| ---------- | -------------------- |
| it_support | VPN / SAP / Laptop   |
| logistics  | Shipment / Warehouse |
| hr         | Leave / Expense      |
| security   | Access control       |
| onboarding | New employee guide   |

---

# Recommended Status Values

```text id="u4eg3u"
draft
active
archived
deprecated
```

---

# Recommended Access Levels

```text id="yrv05f"
public
internal
restricted
```

---

# Recommended Indexes

## Full Text Search Index

```sql id="07o9w0"
CREATE INDEX idx_knowledge_documents_fts
ON knowledge_documents
USING GIN (
  to_tsvector('english', title || ' ' || content)
);
```

---

## Category Index

```sql id="g0j4ow"
CREATE INDEX idx_knowledge_documents_category
ON knowledge_documents(category);
```

---

# Recommended Search Query

```sql id="xavq4k"
SELECT *
FROM knowledge_documents
WHERE to_tsvector('english', title || ' ' || content)
@@ plainto_tsquery('vpn connection');
```
# Recommended Relationships

```text
conversation_sessions
 └── conversations

conversation_sessions
 └── incidents

conversation_sessions
 └── escalation_requests

conversation_sessions
 └── agent_executions

conversation_sessions
```

---

# Recommended PostgreSQL Features

| Feature           | Purpose                  |
| ----------------- | ------------------------ |
| jsonb             | flexible metadata        |
| uuid              | distributed-safe IDs     |
| timestamptz       | timezone-safe timestamps |
| indexes           | performance              |
| full text search  | KB search                |
| pgvector (future) | RAG / semantic search    |

---



