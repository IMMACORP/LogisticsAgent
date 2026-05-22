import {
  createEscalationWorkflow,
  ESCALATION_WORKFLOW_KEY,
} from './definitions/escalation.workflow.js';
import {
  createInventoryShortageWorkflow,
  INVENTORY_SHORTAGE_WORKFLOW_KEY,
} from './definitions/inventory-shortage.workflow.js';
import {
  createShipmentInquiryWorkflow,
  SHIPMENT_INQUIRY_WORKFLOW_KEY,
} from './definitions/shipment-inquiry.workflow.js';
import type { WorkflowDefinition } from './types.js';

const factories: Record<string, () => WorkflowDefinition> = {
  [SHIPMENT_INQUIRY_WORKFLOW_KEY]: createShipmentInquiryWorkflow,
  [ESCALATION_WORKFLOW_KEY]: createEscalationWorkflow,
  [INVENTORY_SHORTAGE_WORKFLOW_KEY]: createInventoryShortageWorkflow,
};

export function listWorkflowKeys(): string[] {
  return Object.keys(factories);
}

export function resolveWorkflowDefinition(key: string): WorkflowDefinition {
  const factory = factories[key];
  if (!factory) {
    throw new Error(`Unknown workflow key: ${key}`);
  }
  return factory();
}

export {
  SHIPMENT_INQUIRY_WORKFLOW_KEY,
  ESCALATION_WORKFLOW_KEY,
  INVENTORY_SHORTAGE_WORKFLOW_KEY,
};
