Define:
- session state
- memory
- context window
- conversation history

# 10.1 Conversation State

```ts
export interface ConversationState {
  sessionId: string;
  currentAgent: AgentType;
  currentIntent?: IntentType;
  collectedInformation: Record<string, unknown>;
  missingInformation?: string[];
  escalationRequired: boolean;
  lastUpdatedAt: string;
}
```

---

# Example

```json
{
  "sessionId": "sess_001",
  "currentAgent": "reception_agent",
  "currentIntent": "it_support",
  "collectedInformation": {
    "office": "Tokyo"
  },
  "missingInformation": [],
  "escalationRequired": false
}
```

---