import { z } from 'zod';
const warehouseCodeSchema = z
    .string()
    .trim()
    .min(1, '倉庫コードを入力してください')
    .max(64, '倉庫コードは64文字以内で入力してください');
const itemCodeSchema = z
    .string()
    .trim()
    .min(1, '品目コードを入力してください')
    .max(128, '品目コードは128文字以内で入力してください');
const quantitySchema = z
    .number()
    .int('数量は整数で指定してください')
    .positive('数量は1以上で指定してください');
export const searchInventoryInputSchema = z
    .object({
    itemCode: itemCodeSchema.optional(),
    itemName: z.string().trim().min(1).max(512).optional(),
    warehouseCode: warehouseCodeSchema.optional(),
    limit: z.number().int().min(1).max(100).optional(),
})
    .refine((value) => value.itemCode || value.itemName || value.warehouseCode, {
    message: 'itemCode、itemName、warehouseCode のいずれか1つ以上を指定してください',
});
export const checkStockAvailabilityInputSchema = z.object({
    warehouseCode: warehouseCodeSchema,
    itemCode: itemCodeSchema,
    requestedQuantity: quantitySchema,
});
export const reserveInventoryInputSchema = z.object({
    warehouseCode: warehouseCodeSchema,
    itemCode: itemCodeSchema,
    quantity: quantitySchema,
    reservationReference: z.string().trim().min(1).max(128).optional(),
});
