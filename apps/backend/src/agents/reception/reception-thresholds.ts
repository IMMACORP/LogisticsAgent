function readEnvFloat(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Minimum confidence before we auto-run a specialist after reception. */
export function receptionRouteMinConfidence(): number {
  const v = readEnvFloat('INQUIRY_RECEPTION_ROUTE_MIN_CONFIDENCE', 0.62);
  return Math.min(1, Math.max(0, v));
}

/** At or below this confidence we notify Slack (unless already escalated by the model). */
export function receptionEscalateMaxConfidence(): number {
  const v = readEnvFloat('INQUIRY_RECEPTION_ESCALATE_MAX_CONFIDENCE', 0.42);
  return Math.min(1, Math.max(0, v));
}

/** Minimum information completeness before auto-routing. */
export function receptionRouteMinCompleteness(): number {
  const v = readEnvFloat('INQUIRY_RECEPTION_ROUTE_MIN_COMPLETENESS', 0.45);
  return Math.min(1, Math.max(0, v));
}

export function slackEscalationChannelLabel(): string {
  return process.env.SLACK_ESCALATION_CHANNEL?.trim() || 'escalations';
}
