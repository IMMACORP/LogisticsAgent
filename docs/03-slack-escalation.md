Define:
- escalation conditions
- Slack channel
- payload format
- retry policy


# 9. Escalation Contracts
# Escalation Conditions
Base on Reception Agent:
- Confidence < 0.6
- Unknown inquiry type
- Sensitive request

## File

```text
contracts/escalation-contracts.ts
```

---

# 9.1 Escalation Priority

```ts
export type EscalationPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";
```

---

# 9.2 Escalation Request

```ts
export interface EscalationRequest {
  sessionId: string;
  sourceAgent: AgentType;
  category: string;
  priority: EscalationPriority;
  reason: string;
  summary: string;
  createdAt: string;
}
```

---

# Example

```json
{
  "sourceAgent": "it_support_agent",
  "priority": "HIGH",
  "reason": "VPN outage",
  "summary": "Multiple users cannot connect VPN."
}
```
---