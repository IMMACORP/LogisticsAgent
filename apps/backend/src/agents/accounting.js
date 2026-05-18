export async function handleAccounting(request) {
    return {
        success: true,
        message: 'Accounting support agent received the request.',
        details: {
            channel: request.channel,
            prompt: request.prompt,
            note: 'This stub can be extended for invoices, reimbursements, and approvals.'
        }
    };
}
