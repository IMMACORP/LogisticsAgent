/**
 * Builds a concise operator-facing summary from in-memory turns or the last user message.
 */
export function summarizeConversationForEscalation(input, activeTriggers) {
    const lines = [
        `【エスカレーション要約】トリガー: ${activeTriggers.join(', ')}`,
    ];
    if (input.context.channel) {
        lines.push(`チャネル: ${input.context.channel}`);
    }
    if (input.context.agentName) {
        lines.push(`エージェント: ${input.context.agentName}`);
    }
    if (input.context.confidence != null) {
        lines.push(`信頼度: ${input.context.confidence}`);
    }
    const turns = input.context.conversationTurns;
    if (turns && turns.length > 0) {
        lines.push('', '--- 会話抜粋 ---');
        const recent = turns.slice(-8);
        for (const t of recent) {
            const prefix = t.role === 'user' ? 'ユーザー' : t.role === 'assistant' ? 'アシスタント' : t.role;
            const snippet = t.content.length > 400 ? `${t.content.slice(0, 400)}…` : t.content;
            lines.push(`[${prefix}] ${snippet}`);
        }
    }
    else if (input.context.lastUserMessage) {
        lines.push('', '--- 直近ユーザー発話 ---', input.context.lastUserMessage);
    }
    if (input.context.shipment) {
        lines.push('', '--- 配送コンテキスト ---', JSON.stringify(input.context.shipment, null, 0));
    }
    if (input.context.toolFailure) {
        lines.push('', '--- ツール失敗 ---', `${input.context.toolFailure.toolName}: ${input.context.toolFailure.message}`);
    }
    if (input.context.retryFailure) {
        lines.push('', '--- リトライ枯渇 ---', `${input.context.retryFailure.operation} (${input.context.retryFailure.attempts} 回)`);
    }
    return lines.join('\n');
}
