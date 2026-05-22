import type {
  EscalationTrigger,
  EscalationWorkflowInput,
} from '../../schemas/escalation/escalation.schemas.js';

const DEFAULT_CONFIDENCE_THRESHOLD = 0.42;

export interface TriggerEvaluationResult {
  activeTriggers: EscalationTrigger[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  severity: 'info' | 'warning' | 'error' | 'critical';
  triggerDetails: Record<string, unknown>;
}

type ContextInput = EscalationWorkflowInput['context'];

function isLowConfidence(ctx: ContextInput): boolean {
  if (ctx.confidence == null) {
    return false;
  }
  const threshold = ctx.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  return ctx.confidence <= threshold;
}

function isMissingShipmentData(ctx: ContextInput): boolean {
  const s = ctx.shipment;
  if (!s) {
    return false;
  }
  if (!s.trackingNumber?.trim()) {
    return true;
  }
  if (s.lookupAttempted === true && s.found === false) {
    return true;
  }
  return Boolean(s.errorMessage);
}

function hasToolFailure(ctx: ContextInput): boolean {
  return Boolean(ctx.toolFailure?.toolName && ctx.toolFailure?.message);
}

function hasRetryFailure(ctx: ContextInput): boolean {
  return Boolean(ctx.retryFailure?.operation && (ctx.retryFailure?.attempts ?? 0) >= 2);
}

export function evaluateEscalationTriggers(
  requested: EscalationTrigger[],
  context: ContextInput,
): TriggerEvaluationResult {
  const activeTriggers: EscalationTrigger[] = [];
  const triggerDetails: Record<string, unknown> = {};

  for (const t of requested) {
    switch (t) {
      case 'low_confidence':
        if (isLowConfidence(context)) {
          activeTriggers.push(t);
          triggerDetails.low_confidence = {
            confidence: context.confidence,
            threshold: context.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD,
          };
        }
        break;
      case 'missing_shipment_data':
        if (isMissingShipmentData(context)) {
          activeTriggers.push(t);
          triggerDetails.missing_shipment_data = context.shipment;
        }
        break;
      case 'tool_execution_failure':
        if (hasToolFailure(context)) {
          activeTriggers.push(t);
          triggerDetails.tool_execution_failure = context.toolFailure;
        }
        break;
      case 'repeated_retry_failure':
        if (hasRetryFailure(context)) {
          activeTriggers.push(t);
          triggerDetails.repeated_retry_failure = context.retryFailure;
        }
        break;
      default: {
        const _exhaustive: never = t;
        return _exhaustive;
      }
    }
  }

  let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  let severity: TriggerEvaluationResult['severity'] = 'warning';

  if (
    activeTriggers.includes('repeated_retry_failure') ||
    activeTriggers.includes('tool_execution_failure')
  ) {
    priority = 'HIGH';
    severity = 'error';
  } else if (activeTriggers.includes('missing_shipment_data')) {
    priority = 'MEDIUM';
    severity = 'warning';
  } else if (activeTriggers.includes('low_confidence')) {
    priority = 'MEDIUM';
    severity = 'warning';
  }

  if (activeTriggers.length >= 2) {
    priority = 'HIGH';
    severity = 'error';
  }

  return { activeTriggers, priority, severity, triggerDetails };
}

export function assertTriggersSubstantiated(
  requested: EscalationTrigger[],
  context: ContextInput,
): TriggerEvaluationResult {
  const result = evaluateEscalationTriggers(requested, context);
  if (result.activeTriggers.length === 0) {
    throw new Error(
      `No escalation triggers substantiated for: ${requested.join(', ')}. Provide matching context.`,
    );
  }
  return result;
}
