import type { AgentRequest, AgentResponse } from '@inquiry-agent/shared-types';

export async function handleAccounting(request: AgentRequest): Promise<AgentResponse> {
  return {
    success: true,
    message: 'Accounting support agent received the request.',
    details: {
      channel: request.channel,
      prompt: request.prompt,
      note: 'This stub can be extended for invoices, reimbursements, and approvals.'
    }
  };
}
