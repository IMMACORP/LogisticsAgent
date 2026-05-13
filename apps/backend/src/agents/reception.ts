import type { AgentRequest, AgentResponse } from '@inquiry-agent/shared-types';

export async function handleReception(request: AgentRequest): Promise<AgentResponse> {
  return {
    success: true,
    message: 'Reception agent processed your request.',
    details: {
      channel: request.channel,
      prompt: request.prompt,
      note: 'This is a starter stub for the reception agent.'
    }
  };
}
