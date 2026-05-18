export async function handleReception(request) {
    return {
        success: true,
        message: 'Reception agent processed your request.',
        details: {
            channel: request.channel,
            prompt: request.prompt,
            note: 'This is a starter stub for the reception agent.'
        }
    };
}
