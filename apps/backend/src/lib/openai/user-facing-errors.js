/**
 * Maps OpenAI / SDK errors to clearer messages for chat SSE and logs.
 */
export function toUserFacingOpenAIError(raw) {
    const lower = raw.toLowerCase();
    if (lower.includes('quota') ||
        lower.includes('insufficient_quota') ||
        lower.includes('billing') && lower.includes('exceeded')) {
        return {
            code: 'OPENAI_QUOTA',
            recoverable: false,
            message: 'OpenAI API の利用上限（クォータ）に達しています。' +
                ' [OpenAI の請求・利用状況](https://platform.openai.com/settings/organization/billing) でプラン、支払い方法、残高を確認し、クレジットを追加するか上限を引き上げてください。',
        };
    }
    if (raw.includes('401') ||
        lower.includes('incorrect api key') ||
        lower.includes('invalid_api_key')) {
        return {
            code: 'OPENAI_AUTH',
            recoverable: false,
            message: 'OpenAI API の認証に失敗しました（401）。' +
                ' `sk-proj-*` キーには `OPENAI_PROJECT_ID=proj_...` が必要です（`apps/backend/.env`）。' +
                ' 確認: `npm run check:openai`',
        };
    }
    if (lower.includes('rate limit') || raw.includes('429')) {
        return {
            code: 'OPENAI_RATE_LIMIT',
            recoverable: true,
            message: 'OpenAI API のレート制限に達しました。しばらく待ってから再試行してください。',
        };
    }
    return {
        code: 'AGENT_STREAM_FAILED',
        message: raw,
        recoverable: true,
    };
}
