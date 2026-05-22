import { isRetryableAgentError, runWithRetries } from '../lib/agents/retry-async.js';
import { WorkflowError } from './workflow-error.js';
export const defaultWorkflowRetryPolicy = {
    maxAttempts: 3,
    baseDelayMs: 400,
    isRetryable: (err) => {
        if (err instanceof WorkflowError) {
            if (err.code === 'VALIDATION' || err.code === 'TIMEOUT' || err.code === 'ABORTED') {
                return false;
            }
        }
        return isRetryableAgentError(err);
    },
};
export function mergeRetryPolicy(override) {
    const base = defaultWorkflowRetryPolicy;
    return {
        maxAttempts: override?.maxAttempts ?? base.maxAttempts,
        baseDelayMs: override?.baseDelayMs ?? base.baseDelayMs,
        isRetryable: override?.isRetryable ?? base.isRetryable,
    };
}
export { runWithRetries };
