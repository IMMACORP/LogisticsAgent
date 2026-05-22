"use client";

import { Headphones, Loader2 } from "lucide-react";

import { EscalationBadge } from "@/components/inquiry/escalation-badge";
import { EscalationOperatorTimeline } from "@/components/inquiry/escalation-operator-timeline";
import { EscalationRetryIndicatorBar } from "@/components/inquiry/escalation-retry-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEscalationStatus } from "@/lib/hooks/use-escalation-status";
import { cn } from "@/lib/utils";

interface EscalationStatusPanelProps {
  conversationId?: string;
  className?: string;
}

export function EscalationStatusPanel({
  conversationId,
  className,
}: EscalationStatusPanelProps) {
  const { viewModel, isLoading, isPolling, error, refresh } = useEscalationStatus({
    conversationId,
    enabled: Boolean(conversationId),
  });

  if (!conversationId) {
    return null;
  }

  if (isLoading && !viewModel) {
    return (
      <div
        className={cn(
          "mx-5 mt-3 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="size-3.5 animate-spin" />
        エスカレーション状態を確認中…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "mx-5 mt-3 rounded-lg border border-destructive/30 bg-red-50 px-3 py-2 text-xs text-destructive",
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (!viewModel) {
    return null;
  }

  return (
    <Card className={cn("mx-5 mt-3 border-amber-200/80 shadow-sm", className)}>
      <CardHeader className="space-y-3 p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-[#1e3a5f]">
            {viewModel.title}
          </CardTitle>
          <EscalationBadge
            priority={viewModel.priority}
            status={viewModel.status}
            compact
          />
        </div>

        {viewModel.waitingForOperator ? (
          <div
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-950"
            role="status"
            aria-live="polite"
          >
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Headphones className="size-4 text-amber-800" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{viewModel.waitingLabel}</p>
              <p className="mt-0.5 text-[11px] text-amber-800/80">
                {isPolling
                  ? "状態を自動更新しています…"
                  : "担当オペレーターが確認次第、タイムラインに反映されます"}
              </p>
            </div>
            {isPolling ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-amber-700" />
            ) : null}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        {viewModel.retry ? (
          <EscalationRetryIndicatorBar retry={viewModel.retry} />
        ) : null}

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            対応タイムライン
          </p>
          <EscalationOperatorTimeline events={viewModel.timeline} />
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          className="text-[10px] text-[#2563eb] hover:underline"
        >
          状態を更新
        </button>
      </CardContent>
    </Card>
  );
}
