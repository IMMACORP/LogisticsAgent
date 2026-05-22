import { z } from '@hono/zod-openapi';
export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1).openapi({
        description: '1-based page index',
        example: 1,
    }),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(20).openapi({
        description: 'Items per page (max 100)',
        example: 20,
    }),
});
export const paginationMetaSchema = z
    .object({
    page: z.number().int().openapi({ example: 1 }),
    pageSize: z.number().int().openapi({ example: 20 }),
    total: z.number().int().openapi({ example: 42 }),
    totalPages: z.number().int().openapi({ example: 3 }),
})
    .openapi('PaginationMeta');
export function parsePaginationQuery(query) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    return {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
        take: pageSize,
    };
}
export function buildPaginationMeta(total, page, pageSize) {
    return {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
}
export function createPaginatedSchema(itemSchema, name) {
    return z
        .object({
        data: z.array(itemSchema),
        pagination: paginationMetaSchema,
    })
        .openapi(name);
}
