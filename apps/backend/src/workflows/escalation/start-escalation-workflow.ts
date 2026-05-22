import { randomUUID } from 'node:crypto';

import type { EscalationWorkflowInput } from '../../schemas/escalation/escalation.schemas.js';
import { workflowOrchestrator } from '../workflow-orchestrator.service.js';
import { ESCALATION_WORKFLOW_KEY } from '../definitions/escalation.workflow.js';
import type { WorkflowExecutionResult } from '../types.js';

/**
 * Convenience entry for agents/tools when an escalation trigger fires.
 */
export async function startEscalationWorkflow(
  input: EscalationWorkflowInput,
  options?: { traceId?: string; signal?: AbortSignal },
): Promise<WorkflowExecutionResult> {
  const traceId = options?.traceId ?? randomUUID();
  return workflowOrchestrator.startWorkflow({
    workflowKey: ESCALATION_WORKFLOW_KEY,
    initialState: { input },
    traceId,
    signal: options?.signal,
    enableCompensation: true,
  });
}
