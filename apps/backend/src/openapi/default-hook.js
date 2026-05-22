export const defaultOpenApiHook = (result, c) => {
    if (!result.success) {
        const body = {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: result.error.flatten(),
            },
        };
        return c.json(body, 400);
    }
};
