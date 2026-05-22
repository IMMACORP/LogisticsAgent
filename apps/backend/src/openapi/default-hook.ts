import type { Hook } from '@hono/zod-openapi';

import type { ApiError } from '../schemas/history/history.schemas.js';

export const defaultOpenApiHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    const body: ApiError = {
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