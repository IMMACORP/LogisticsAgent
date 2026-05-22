import type {
  EscalationHistoryItem,
  EscalationLogStatus,
  EscalationPriority,
  EscalationRetryIndicator,
  EscalationTimelineEvent,
  EscalationViewModel,
} from "@/lib/types/escalation";

const TRIGGER_LABELS: Record<string, string> = {
  low_confidence: "信頼度低下",
  missing_shipment_data: "配送データ不足",
  tool_execution_failure: "ツール失敗",
  repeated_retry_failure: "リトライ上限",
};

function normalizeStatus(status: string): EscalationLogStatus {
  if (status === "acknowledged" || status === "resolved") {
    return status;
  }
  return "open";
}

function normalizePriority(priority: string): EscalationPriority {
  const upper = priority.toUpperCase();
  if (upper === "HIGH" || upper === "MEDIUM" || upper === "LOW") {
    return upper;
  }
  return "MEDIUM";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function parseTriggers(metadata: Record<string, unknown> | null): string[] {
  if (!metadata) {
    return [];
  }
  const fromMeta = metadata.triggers;
  if (Array.isArray(fromMeta)) {
    return fromMeta.filter((t): t is string => typeof t === "string");
  }
  const payload = asRecord(metadata.structuredPayload);
  const payloadTriggers = payload?.triggers;
  if (Array.isArray(payloadTriggers)) {
    return payloadTriggers.filter((t): t is string => typeof t === "string");
  }
  return [];
}

function parseOperatorTimeline(
  metadata: Record<string, unknown> | null,
): EscalationTimelineEvent[] {
  if (!metadata || !Array.isArray(metadata.operatorTimeline)) {
    return [];
  }

  return metadata.operatorTimeline
    .map((entry, index) => {
      const row = asRecord(entry);
      if (!row || typeof row.at !== "string") {
        return null;
      }
      const message =
        typeof row.message === "string"
          ? row.message
          : typeof row.content === "string"
            ? row.content
            : undefined;
      if (!message) {
        return null;
      }
      return {
        id: `operator-${index}-${row.at}`,
        kind: "operator_reply" as const,
        title: "オペレーター返信",
        detail: message,
        at: row.at,
        author: typeof row.author === "string" ? row.author : undefined,
      };
    })
    .filter((e): e is EscalationTimelineEvent => e !== null);
}

function buildRetryIndicator(
  item: EscalationHistoryItem,
  metadata: Record<string, unknown> | null,
  triggers: string[],
): EscalationRetryIndicator | null {
  const hasRetryTrigger = triggers.includes("repeated_retry_failure");
  const workflowRetry = asRecord(metadata?.workflowRetry);
  const slackRetry = asRecord(metadata?.slackNotifyRetry);

  const payload = asRecord(metadata?.structuredPayload);
  const context = asRecord(payload?.context);
  const triggerDetails = asRecord(context?.triggerDetails);
  const retryFailure = asRecord(triggerDetails?.repeated_retry_failure);

  if (!hasRetryTrigger && !workflowRetry && !slackRetry && !retryFailure) {
    return null;
  }

  const attempts =
    typeof retryFailure?.attempts === "number"
      ? retryFailure.attempts
      : typeof workflowRetry?.attempts === "number"
        ? workflowRetry.attempts
        : typeof slackRetry?.attempts === "number"
          ? slackRetry.attempts
          : undefined;

  const operation =
    typeof retryFailure?.operation === "string"
      ? retryFailure.operation
      : typeof workflowRetry?.stepId === "string"
        ? workflowRetry.stepId
        : undefined;

  const status = normalizeStatus(item.status);
  const active =
    status !== "resolved" &&
    (Boolean(workflowRetry?.inProgress) ||
      Boolean(slackRetry?.inProgress) ||
      (hasRetryTrigger && status === "open"));

  return {
    active,
    label: active ? "リトライ処理中" : "リトライ起因のエスカレーション",
    attempts,
    operation,
    source: workflowRetry
      ? "workflow"
      : slackRetry
        ? "slack"
        : "trigger",
  };
}

function buildLifecycleTimeline(
  item: EscalationHistoryItem,
  status: EscalationLogStatus,
  operatorEvents: EscalationTimelineEvent[],
): EscalationTimelineEvent[] {
  const events: EscalationTimelineEvent[] = [
    {
      id: `${item.id}-created`,
      kind: "escalation_created",
      title: "エスカレーション作成",
      detail: item.escalationReason ?? item.category,
      at: item.createdAt,
    },
  ];

  if (item.slackThreadTs) {
    events.push({
      id: `${item.id}-slack`,
      kind: "slack_notified",
      title: "Slack 通知送信",
      detail: item.assignedTeam
        ? `担当: ${item.assignedTeam}`
        : "オペレーターチャンネルへ通知",
      at: item.createdAt,
    });
  }

  for (const op of operatorEvents) {
    events.push(op);
  }

  if (status === "acknowledged") {
    events.push({
      id: `${item.id}-ack`,
      kind: "operator_acknowledged",
      title: "オペレーター確認",
      detail: "担当者がチケットを確認しました",
      at: item.updatedAt,
    });
  }

  if (status === "resolved" && item.resolvedAt) {
    events.push({
      id: `${item.id}-resolved`,
      kind: "resolved",
      title: "対応完了",
      detail: "エスカレーションが解決されました",
      at: item.resolvedAt,
    });
  } else if (status === "open") {
    events.push({
      id: `${item.id}-waiting`,
      kind: "waiting_operator",
      title: "オペレーター対応待ち",
      detail: "担当チームからの返信をお待ちください",
      at: item.updatedAt,
      pending: true,
    });
  } else if (status === "acknowledged") {
    events.push({
      id: `${item.id}-waiting-followup`,
      kind: "waiting_operator",
      title: "フォローアップ待ち",
      detail: "確認済み — 最終回答を待機中",
      at: item.updatedAt,
      pending: true,
    });
  }

  return events.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export function buildEscalationViewModel(
  item: EscalationHistoryItem,
): EscalationViewModel {
  const metadata = item.metadata;
  const triggers = parseTriggers(metadata);
  const status = normalizeStatus(item.status);
  const priority = normalizePriority(item.priority);
  const operatorEvents = parseOperatorTimeline(metadata);
  const timeline = buildLifecycleTimeline(item, status, operatorEvents);

  const payload = asRecord(metadata?.structuredPayload);
  const title =
    typeof payload?.title === "string"
      ? payload.title
      : triggers.map((t) => TRIGGER_LABELS[t] ?? t).join(" / ") ||
        "エスカレーション";

  const waitingForOperator = status === "open" || status === "acknowledged";
  const waitingLabel =
    status === "open"
      ? "オペレーター対応をお待ちください"
      : status === "acknowledged"
        ? "オペレーター確認済み — 回答待ち"
        : "対応完了";

  return {
    item,
    priority,
    status,
    waitingForOperator,
    waitingLabel,
    retry: buildRetryIndicator(item, metadata, triggers),
    timeline,
    title,
    triggers,
  };
}
