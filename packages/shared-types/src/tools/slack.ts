import type { ToolExecutionContext } from './common';

/** Severity for routing / Block Kit styling (independent of business `priority`) */
export type EscalationSeverity = 'info' | 'warning' | 'error' | 'critical';

export type NotifySlackPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NotifySlackInput {
  channel: string;
  priority: NotifySlackPriority;
  /** When set, overrides automatic mapping from `priority` */
  severity?: EscalationSeverity;
  title: string;
  message: string;
  sessionId: string;
  mentionUsers?: string[];
  /** Extra structured fields merged into the escalation payload */
  metadata?: Record<string, unknown>;
}

export interface NotifySlackOutput {
  success: boolean;
  slackChannel: string;
  threadTs?: string;
  sentAt: string;
  /** Echo of resolved severity for auditing */
  severity: EscalationSeverity;
}

/** Canonical payload attached to Slack messages and logs */
export interface StructuredEscalationPayload {
  schemaVersion: '1.0';
  severity: EscalationSeverity;
  priority: NotifySlackPriority;
  title: string;
  message: string;
  sessionId: string;
  slackChannel: string;
  mentionUsers: string[];
  context?: Pick<ToolExecutionContext, 'userId' | 'agentName' | 'traceId'>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export function priorityToSeverity(priority: NotifySlackPriority): EscalationSeverity {
  switch (priority) {
    case 'LOW':
      return 'info';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'error';
    default:
      return 'warning';
  }
}
