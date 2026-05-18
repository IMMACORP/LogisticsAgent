import type { ToolErrorCode, ToolResult } from '@inquiry-agent/shared-types';

export class ToolExecutionError extends Error {
  constructor(
    message: string,
    readonly code: ToolErrorCode,
    readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

export function toolSuccess<T>(
  data: T,
  startedAt: number,
  metadata?: Record<string, unknown>,
): ToolResult<T> {
  return {
    success: true,
    data,
    executionTimeMs: Date.now() - startedAt,
    metadata,
  };
}

export function toolFailure(
  error: string,
  code: ToolErrorCode,
  startedAt: number,
  metadata?: Record<string, unknown>,
): ToolResult<never> {
  return {
    success: false,
    error,
    errorCode: code,
    executionTimeMs: Date.now() - startedAt,
    metadata,
  };
}

export function mapToolError(
  error: unknown,
  startedAt: number,
): ToolResult<never> {
  if (error instanceof ToolExecutionError) {
    return toolFailure(error.message, error.code, startedAt, error.metadata);
  }

  if (error instanceof Error) {
    return toolFailure(error.message, 'DATABASE_ERROR', startedAt);
  }

  return toolFailure('An unexpected error occurred', 'DATABASE_ERROR', startedAt);
}

export async function runTool<T>(
  operation: () => Promise<T>,
): Promise<ToolResult<T>> {
  const startedAt = Date.now();
  try {
    const data = await operation();
    return toolSuccess(data, startedAt);
  } catch (error) {
    return mapToolError(error, startedAt);
  }
}
