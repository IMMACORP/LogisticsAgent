import { z } from 'zod';
import { AgentRequest, AgentResponse } from '@inquiry-agent/shared-types';
import { handleReception } from './reception.js';
import { handleHr } from './hr.js';
import { handleIt } from './it.js';
import { handleAccounting } from './accounting.js';

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
  switch (request.channel) {
    case 'reception':
      return handleReception(request);
    case 'hr':
      return handleHr(request);
    case 'it':
      return handleIt(request);
    case 'accounting':
      return handleAccounting(request);
    case 'logistics':
      return handleReception(request);
    default:
      return {
        success: false,
        message: `Unsupported channel: ${request.channel}`
      };
  }
}
