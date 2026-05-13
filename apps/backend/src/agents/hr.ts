import type { AgentRequest, AgentResponse } from '@inquiry-agent/shared-types';

export async function handleHr(request: AgentRequest): Promise<AgentResponse> {
  return {
    success: true,
    message: 'HR agent received the request.',
    details: {
      channel: request.channel,
      prompt: request.prompt,
      info: 'This is a starter HR agent implementation.'
    }
  };
}
