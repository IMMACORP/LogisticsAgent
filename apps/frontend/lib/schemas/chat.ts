import { z } from "zod";

export const chatInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "お問い合わせ内容を入力してください")
    .max(4000, "4000文字以内で入力してください"),
});

export type ChatInputValues = z.infer<typeof chatInputSchema>;
