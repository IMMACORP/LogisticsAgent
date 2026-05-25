import { handleHr } from './hr.js';
import { handleIt } from './it.js';
import { handleReception } from './reception.js';
import { runAgentWithOpenAISdk } from './run-agent-with-openai-sdk.js';
import { isOpenAIAgentsSdkEnabled } from './runtime/sdk-config.js';
export async function runAgent(request) {
    if (isOpenAIAgentsSdkEnabled()) {
        return runAgentWithOpenAISdk(request);
    }
    switch (request.channel) {
        case 'reception':
            return handleReception(request);
        case 'hr':
            return handleHr(request);
        case 'it':
            return handleIt(request);
        case 'logistics':
            return handleReception(request);
        default:
            return {
                success: false,
                message: `Unsupported channel: ${request.channel}`
            };
    }
}
