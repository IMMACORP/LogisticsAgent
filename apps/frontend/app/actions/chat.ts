"use server";

import type { AgentResponse } from "@inquiry-agent/shared-types";

import { chatInputSchema } from "@/lib/schemas/chat";

export type SendInquiryResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const DEMO_MARKDOWN = `## 配送状況の確認結果

以下の内容を確認しました。

- **配送番号**: SHP-2026-001
- **現在地**: Osaka Hub
- **遅延時間**: 120分

### 推奨アクション

1. 代替ルートを利用
2. 顧客へ通知
3. 優先配送へ切替

\`\`\`json
{
  "priority": "high",
  "reroute": true,
  "estimated_delay": 120
}
\`\`\`
`;

export async function sendLogisticsInquiry(
  prompt: string,
): Promise<SendInquiryResult> {
  const parsed = chatInputSchema.safeParse({ prompt });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "入力内容が不正です",
    };
  }

  const apiBase =
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBase) {
    return { ok: true, message: DEMO_MARKDOWN };
  }

  try {
    const response = await fetch(`${apiBase}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "web-guest",
        channel: "logistics",
        prompt: parsed.data.prompt,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: true, message: DEMO_MARKDOWN };
    }

    const data = (await response.json()) as AgentResponse;
    if (!data.success) {
      return { ok: false, error: data.message || "エージェントの応答に失敗しました" };
    }

    return { ok: true, message: data.message };
  } catch {
    return { ok: true, message: DEMO_MARKDOWN };
  }
}
