"use client";

import { Badge } from "@/components/ui/badge";
import type { EscalationLogStatus, EscalationPriority } from "@/lib/types/escalation";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS: Record<EscalationPriority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};

const STATUS_LABELS: Record<EscalationLogStatus, string> = {
  open: "対応待ち",
  acknowledged: "確認済",
  resolved: "完了",
};

function priorityVariant(
  priority: EscalationPriority,
): "danger" | "warning" | "secondary" {
  if (priority === "HIGH") {
    return "danger";
  }
  if (priority === "MEDIUM") {
    return "warning";
  }
  return "secondary";
}

function statusVariant(
  status: EscalationLogStatus,
): "warning" | "info" | "success" {
  if (status === "open") {
    return "warning";
  }
  if (status === "acknowledged") {
    return "info";
  }
  return "success";
}

interface EscalationBadgeProps {
  priority: EscalationPriority;
  status: EscalationLogStatus;
  className?: string;
  compact?: boolean;
}

export function EscalationBadge({
  priority,
  status,
  className,
  compact = false,
}: EscalationBadgeProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-950">
        <span
          className={cn(
            "size-1.5 rounded-full bg-amber-500",
            status !== "resolved" && "animate-pulse",
          )}
          aria-hidden
        />
        {compact ? "Esc" : "エスカレーション"}
      </Badge>
      <Badge variant={priorityVariant(priority)}>
        {PRIORITY_LABELS[priority]}
      </Badge>
      <Badge variant={statusVariant(status)}>{STATUS_LABELS[status]}</Badge>
    </div>
  );
}
