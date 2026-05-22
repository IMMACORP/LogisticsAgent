"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { EscalationStatusPanel } from "@/components/inquiry/escalation-status-panel";
import { MarkdownMessage } from "@/components/inquiry/markdown-message";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import { useChatStream } from "@/lib/hooks/use-chat-stream";
import { chatInputSchema, type ChatInputValues } from "@/lib/schemas/chat";
import type { ChatMessage } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    lastTraceId,
    sessionId,
    conversationId,
    sendMessage,
    retryLastMessage,
    clearChat,
  } = useChatStream();

  const bottomRef = useRef<HTMLDivElement>(null);
  const apiConfigured = Boolean(getApiBaseUrl());

  const form = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { prompt: "" },
  });

  const busy = isLoading || isStreaming;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await sendMessage(values.prompt);
    form.reset();
  });

  const lastMessage = messages[messages.length - 1];
  const showRetry =
    lastMessage?.role === "assistant" &&
    lastMessage.status === "error" &&
    lastMessage.recoverable;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-l border-border bg-slate-50",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
        <div>
          <p className="font-semibold text-[#1e3a5f]">ロジスティクス・エージェント</p>
          <p
            className={cn(
              "text-xs",
              busy ? "text-amber-600" : apiConfigured ? "text-emerald-600" : "text-destructive",
            )}
          >
            {busy
              ? "● 応答を生成中…"
              : apiConfigured
                ? "● オンライン（SSE）"
                : "● API 未設定"}
          </p>
          {lastTraceId ? (
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              trace: {lastTraceId.slice(0, 8)}…
              {sessionId ? ` · session: ${sessionId.slice(0, 8)}…` : null}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearChat}
          disabled={busy}
        >
          新規チャット
        </Button>
      </div>

      {!apiConfigured ? (
        <div className="mx-5 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertCircle className="mr-1 inline size-3.5" />
          `NEXT_PUBLIC_API_BASE_URL` を設定してください（例: http://localhost:3001）。
        </div>
      ) : null}

      <EscalationStatusPanel conversationId={conversationId} />

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-5 py-5">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
              物流に関するお問い合わせを入力してください。配送状況の確認、在庫、ルート最適化などをサポートします。
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {showRetry ? (
        <div className="border-t border-border bg-white px-4 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => void retryLastMessage()}
            disabled={busy}
          >
            <RefreshCw className="mr-2 size-4" />
            再試行
          </Button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-white p-4"
      >
        <div className="rounded-xl border border-border bg-slate-50 p-3">
          <Textarea
            {...form.register("prompt")}
            placeholder="物流に関するお問い合わせを入力してください..."
            className="min-h-[100px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            disabled={busy || !apiConfigured}
          />
          {form.formState.errors.prompt ? (
            <p className="mt-2 text-xs text-destructive">
              {form.formState.errors.prompt.message}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {busy ? "ストリーミング応答中" : "WMS / TMS 連携対応"}
            </p>
            <Button
              type="submit"
              disabled={busy || !apiConfigured}
              className="rounded-full bg-[#1e3a5f] hover:bg-[#152a47]"
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              送信
            </Button>
          </div>
        </div>
      </form>
    </aside>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] rounded-2xl bg-[#1e3a5f] px-4 py-3 text-sm leading-6 text-white shadow">
          {message.content}
        </div>
      </div>
    );
  }

  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isError ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs font-semibold text-[#2563eb]">ロジスティクス・エージェント</p>
        {isStreaming ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            入力中
          </span>
        ) : null}
      </div>
      {message.content ? (
        <MarkdownMessage content={message.content} />
      ) : isStreaming ? (
        <p className="text-sm text-muted-foreground animate-pulse">考えています…</p>
      ) : null}
    </div>
  );
}
