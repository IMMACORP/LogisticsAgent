import { z } from 'zod';
import { agentNullable } from '../agent-zod.js';
export const shipmentStatusSchema = z.enum([
    'PENDING',
    'IN_TRANSIT',
    'DELAYED',
    'DELIVERED',
    'CANCELLED',
]);
export const deliveryIssueStatusSchema = z.enum(['DELAYED', 'CANCELLED']);
const trackingNumberSchema = z
    .string()
    .trim()
    .min(3, '送り状番号は3文字以上で入力してください')
    .max(128, '送り状番号は128文字以内で入力してください')
    .regex(/^[A-Z0-9-]+$/i, '送り状番号は英数字とハイフンのみ使用できます');
const isoDateSchema = z
    .string()
    .datetime({ message: '日付はISO 8601形式で指定してください' });
export const getShipmentStatusInputSchema = z.object({
    trackingNumber: trackingNumberSchema,
});
const searchShipmentHistoryObjectSchema = z
    .object({
    trackingNumber: agentNullable(trackingNumberSchema),
    customerName: agentNullable(z.string().trim().min(1).max(255)),
    shipmentStatus: agentNullable(shipmentStatusSchema),
    fromDate: agentNullable(isoDateSchema),
    toDate: agentNullable(isoDateSchema),
    limit: agentNullable(z.number().int().min(1).max(50)),
})
    .refine((value) => value.trackingNumber ??
    value.customerName ??
    value.shipmentStatus ??
    value.fromDate ??
    value.toDate, {
    message: 'trackingNumber, customerName, shipmentStatus, fromDate, toDate のいずれか1つ以上を指定してください',
});
export const searchShipmentHistoryToolParametersSchema = searchShipmentHistoryObjectSchema;
export const searchShipmentHistoryInputSchema = searchShipmentHistoryToolParametersSchema;
const searchDeliveryIssueObjectSchema = z
    .object({
    trackingNumber: agentNullable(trackingNumberSchema),
    customerName: agentNullable(z.string().trim().min(1).max(255)),
    issueStatus: agentNullable(deliveryIssueStatusSchema),
    fromDate: agentNullable(isoDateSchema),
    toDate: agentNullable(isoDateSchema),
    limit: agentNullable(z.number().int().min(1).max(50)),
})
    .refine((value) => value.trackingNumber ??
    value.customerName ??
    value.issueStatus ??
    value.fromDate ??
    value.toDate, {
    message: 'trackingNumber, customerName, issueStatus, fromDate, toDate のいずれか1つ以上を指定してください',
});
export const searchDeliveryIssueToolParametersSchema = searchDeliveryIssueObjectSchema;
export const searchDeliveryIssueInputSchema = searchDeliveryIssueToolParametersSchema;
