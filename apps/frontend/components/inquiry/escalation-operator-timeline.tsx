"use client";

import type { ComponentType } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Radio,
  Send,
} from "lucide-react";

import { formatEscalationDateTime } from "@/lib/format/datetime";
import type { EscalationTimelineEvent, EscalationTimelineKind } from "@/lib/types/escalation";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<
  EscalationTimelineKind,
  ComponentType<{ className?: string }>
> = {
  escalation_created: Radio,
  slack_notified: Send,
  waiting_operator: Clock,
  operator_acknowledged: CheckCircle2,
  operator_reply: MessageSquare,
  resolved: CheckCircle2,
};

interface EscalationOperatorTimelineProps {
  events: EscalationTimelineEvent[];
  className?: string;
}

export function EscalationOperatorTimeline({
  events,
  className,
}: EscalationOperatorTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <ol className={cn("relative space-y-0", className)} aria-label="オペレーター対応履歴">
      {events.map((event, index) => {
        const Icon = KIND_ICON[event.kind];
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[11px] top-6 bottom-0 w-px bg-border"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border",
                event.pending
                  ? "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200/80"
                  : event.kind === "resolved"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : event.kind === "operator_reply"
                      ? "border-[#2563eb] bg-sky-50 text-[#2563eb]"
                      : "border-border bg-white text-muted-foreground",
              )}
            >
              <Icon className="size-3" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    event.pending ? "text-amber-800" : "text-[#1e3a5f]",
                  )}
                >
                  {event.title}
                  {event.pending ? (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 font-normal text-amber-600">
                      <Circle className="size-1.5 fill-current animate-pulse" />
                      進行中
                    </span>
                  ) : null}
                </p>
                <time
                  className="text-[10px] text-muted-foreground"
                  dateTime={event.at}
                >
                  {formatEscalationDateTime(event.at)}
                </time>
              </div>
              {event.author ? (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {event.author}
                </p>
              ) : null}
              {event.detail ? (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {event.detail}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
