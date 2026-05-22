import { z } from 'zod';

import { agentNullable } from '../agent-zod.js';

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

const searchInventoryObjectSchema = z
  .object({
    itemCode: agentNullable(itemCodeSchema),
    itemName: agentNullable(z.string().trim().min(1).max(512)),
    warehouseCode: agentNullable(warehouseCodeSchema),
    limit: agentNullable(z.number().int().min(1).max(100)),
  })
  .refine(
    (value) => value.itemCode ?? value.itemName ?? value.warehouseCode,
    {
      message:
        'itemCode、itemName、warehouseCode のいずれか1つ以上を指定してください',
    },
  );

export const searchInventoryToolParametersSchema = searchInventoryObjectSchema;

export const searchInventoryInputSchema = searchInventoryToolParametersSchema;

export const checkStockAvailabilityInputSchema = z.object({
  warehouseCode: warehouseCodeSchema,
  itemCode: itemCodeSchema,
  requestedQuantity: quantitySchema,
});

const reserveInventoryObjectSchema = z.object({
  warehouseCode: warehouseCodeSchema,
  itemCode: itemCodeSchema,
  quantity: quantitySchema,
  reservationReference: agentNullable(z.string().trim().min(1).max(128)),
});

export const reserveInventoryToolParametersSchema = reserveInventoryObjectSchema;

export const reserveInventoryInputSchema = reserveInventoryToolParametersSchema;

export type SearchInventoryInputSchema = z.infer<
  typeof searchInventoryInputSchema
>;
export type CheckStockAvailabilityInputSchema = z.infer<
  typeof checkStockAvailabilityInputSchema
>;
export type ReserveInventoryInputSchema = z.infer<
  typeof reserveInventoryInputSchema
>;
