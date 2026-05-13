export interface AgentRequest {
  userId: string;
  channel: 'hr' | 'it' | 'logistics' | 'accounting' | 'reception';
  prompt: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface SlackNotificationPayload {
  channelId: string;
  text: string;
  blocks?: unknown[];
}
