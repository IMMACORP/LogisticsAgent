import { WorkflowError } from './workflow-error.js';
export async function withTimeout(factory, timeoutMs, signal) {
    if (timeoutMs <= 0) {
        return factory();
    }
    const ctrl = new AbortController();
    const onParentAbort = () => ctrl.abort();
    if (signal) {
        if (signal.aborted) {
            throw new WorkflowError('ABORTED', 'Workflow was aborted before step started');
        }
        signal.addEventListener('abort', onParentAbort, { once: true });
    }
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const runPromise = factory();
        const abortPromise = new Promise((_, reject) => {
            ctrl.signal.addEventListener('abort', () => reject(new WorkflowError('TIMEOUT', `Step timed out after ${timeoutMs}ms`)), { once: true });
        });
        return await Promise.race([runPromise, abortPromise]);
    }
    finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onParentAbort);
    }
}
