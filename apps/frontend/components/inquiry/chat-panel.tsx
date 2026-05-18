"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";

import { sendLogisticsInquiry } from "@/app/actions/chat";
import { MarkdownMessage } from "@/components/inquiry/markdown-message";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { chatInputSchema, type ChatInputValues } from "@/lib/schemas/chat";
import type { ChatMessage } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  className?: string;
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function ChatPanel({
  messages,
  onMessagesChange,
  className,
}: ChatPanelProps) {
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { prompt: "" },
  });

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const handleSubmit = form.handleSubmit((values) => {
    const userMessage = createMessage("user", values.prompt);
    const nextMessages = [...messages, userMessage];
    onMessagesChange(nextMessages);
    form.reset();
    scrollToBottom();

    startTransition(async () => {
      const result = await sendLogisticsInquiry(values.prompt);
      if (result.ok) {
        onMessagesChange([
          ...nextMessages,
          createMessage("assistant", result.message),
        ]);
      } else {
        onMessagesChange([
          ...nextMessages,
          createMessage("assistant", `**エラー**: ${result.error}`),
        ]);
      }
      scrollToBottom();
    });
  });

  const handleNewChat = () => {
    onMessagesChange([]);
    form.reset();
  };

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
          <p className="text-xs text-emerald-600">● オンライン</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          disabled={isPending}
        >
          新規チャット
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-5 py-5">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
              物流に関するお問い合わせを入力してください。配送状況の確認、在庫、ルート最適化などをサポートします。
            </div>
          ) : (
            messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[90%] rounded-2xl bg-[#1e3a5f] px-4 py-3 text-sm leading-6 text-white shadow">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div
                  key={message.id}
                  className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <p className="mb-2 text-xs font-semibold text-[#2563eb]">
                    ロジスティクス・エージェント
                  </p>
                  <MarkdownMessage content={message.content} />
                </div>
              ),
            )
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-white p-4"
      >
        <div className="rounded-xl border border-border bg-slate-50 p-3">
          <Textarea
            {...form.register("prompt")}
            placeholder="物流に関するお問い合わせを入力してください..."
            className="min-h-[100px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            disabled={isPending}
          />
          {form.formState.errors.prompt ? (
            <p className="mt-2 text-xs text-destructive">
              {form.formState.errors.prompt.message}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              WMS / TMS 連携対応
            </p>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#1e3a5f] hover:bg-[#152a47]"
            >
              {isPending ? (
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
