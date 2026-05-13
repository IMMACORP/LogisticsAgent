import type { AgentRequest, AgentResponse } from '@inquiry-agent/shared-types';

export async function handleIt(request: AgentRequest): Promise<AgentResponse> {
  return {
    success: true,
    message: 'IT support agent is processing your ticket.',
    details: {
      request: request.prompt,
      recommendedAction: 'Review system status and escalate if needed.'
    }
  };
}
