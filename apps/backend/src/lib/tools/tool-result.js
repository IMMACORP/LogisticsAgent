export class ToolExecutionError extends Error {
    code;
    metadata;
    constructor(message, code, metadata) {
        super(message);
        this.code = code;
        this.metadata = metadata;
        this.name = 'ToolExecutionError';
    }
}
export function toolSuccess(data, startedAt, metadata) {
    return {
        success: true,
        data,
        executionTimeMs: Date.now() - startedAt,
        metadata,
    };
}
export function toolFailure(error, code, startedAt, metadata) {
    return {
        success: false,
        error,
        errorCode: code,
        executionTimeMs: Date.now() - startedAt,
        metadata,
    };
}
export function mapToolError(error, startedAt) {
    if (error instanceof ToolExecutionError) {
        return toolFailure(error.message, error.code, startedAt, error.metadata);
    }
    if (error instanceof Error) {
        return toolFailure(error.message, 'DATABASE_ERROR', startedAt);
    }
    return toolFailure('An unexpected error occurred', 'DATABASE_ERROR', startedAt);
}
export async function runTool(operation) {
    const startedAt = Date.now();
    try {
        const data = await operation();
        return toolSuccess(data, startedAt);
    }
    catch (error) {
        return mapToolError(error, startedAt);
    }
}
