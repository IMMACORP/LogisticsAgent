export type EscalationPriority = "LOW" | "MEDIUM" | "HIGH";

export type EscalationLogStatus = "open" | "acknowledged" | "resolved";

export interface EscalationHistoryItem {
  id: string;
  conversationId: string | null;
  category: string;
  priority: string;
  escalationReason: string | null;
  assignedTeam: string | null;
  slackThreadTs: string | null;
  status: string;
  resolvedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedEscalationHistory {
  data: EscalationHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type EscalationTimelineKind =
  | "escalation_created"
  | "slack_notified"
  | "waiting_operator"
  | "operator_acknowledged"
  | "operator_reply"
  | "resolved";

export interface EscalationTimelineEvent {
  id: string;
  kind: EscalationTimelineKind;
  title: string;
  detail?: string;
  at: string;
  /** Highlight as the current in-progress step */
  pending?: boolean;
  author?: string;
}

export interface EscalationRetryIndicator {
  active: boolean;
  label: string;
  attempts?: number;
  operation?: string;
  source: "trigger" | "workflow" | "slack";
}

export interface EscalationViewModel {
  item: EscalationHistoryItem;
  priority: EscalationPriority;
  status: EscalationLogStatus;
  waitingForOperator: boolean;
  waitingLabel: string;
  retry: EscalationRetryIndicator | null;
  timeline: EscalationTimelineEvent[];
  title: string;
  triggers: string[];
}
