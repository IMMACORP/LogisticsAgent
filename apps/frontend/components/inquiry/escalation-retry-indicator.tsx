"use client";

import { Loader2, RefreshCw } from "lucide-react";

import type { EscalationRetryIndicator } from "@/lib/types/escalation";
import { cn } from "@/lib/utils";

interface EscalationRetryIndicatorProps {
  retry: EscalationRetryIndicator;
  className?: string;
}

export function EscalationRetryIndicatorBar({
  retry,
  className,
}: EscalationRetryIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
        retry.active
          ? "border-sky-200 bg-sky-50 text-sky-900"
          : "border-slate-200 bg-slate-50 text-slate-700",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {retry.active ? (
        <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" aria-hidden />
      ) : (
        <RefreshCw className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{retry.label}</p>
        {retry.operation || retry.attempts != null ? (
          <p className="mt-0.5 text-[11px] opacity-80">
            {retry.operation ? `${retry.operation}` : null}
            {retry.operation && retry.attempts != null ? " · " : null}
            {retry.attempts != null ? `${retry.attempts} 回試行` : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
