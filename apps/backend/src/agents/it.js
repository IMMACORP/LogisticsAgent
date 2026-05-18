export async function handleIt(request) {
    return {
        success: true,
        message: 'IT support agent is processing your ticket.',
        details: {
            request: request.prompt,
            recommendedAction: 'Review system status and escalate if needed.'
        }
    };
}
