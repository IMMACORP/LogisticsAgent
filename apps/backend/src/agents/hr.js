export async function handleHr(request) {
    return {
        success: true,
        message: 'HR agent received the request.',
        details: {
            channel: request.channel,
            prompt: request.prompt,
            info: 'This is a starter HR agent implementation.'
        }
    };
}
