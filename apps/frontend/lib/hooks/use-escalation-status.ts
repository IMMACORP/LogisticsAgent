"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchLatestEscalationForConversation } from "@/lib/api/fetch-escalations";
import { buildEscalationViewModel } from "@/lib/escalation/build-escalation-view-model";
import type { EscalationViewModel } from "@/lib/types/escalation";

const POLL_INTERVAL_MS = 12_000;

export interface UseEscalationStatusOptions {
  conversationId?: string;
  /** Poll while waiting for operator */
  enabled?: boolean;
}

export interface UseEscalationStatusResult {
  viewModel: EscalationViewModel | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEscalationStatus(
  options: UseEscalationStatusOptions,
): UseEscalationStatusResult {
  const { conversationId, enabled = true } = options;
  const [viewModel, setViewModel] = useState<EscalationViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!conversationId || !enabled) {
      setViewModel(null);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const item = await fetchLatestEscalationForConversation(conversationId);
      if (controller.signal.aborted) {
        return;
      }
      setViewModel(item ? buildEscalationViewModel(item) : null);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : "エスカレーション情報の取得に失敗しました");
      setViewModel(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [conversationId, enabled]);

  useEffect(() => {
    void refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  useEffect(() => {
    if (!conversationId || !enabled || !viewModel?.waitingForOperator) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
      setIsPolling(false);
    };
  }, [conversationId, enabled, viewModel?.waitingForOperator, refresh]);

  return {
    viewModel,
    isLoading,
    isPolling,
    error,
    refresh,
  };
}
