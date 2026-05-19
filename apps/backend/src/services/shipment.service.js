import { ToolExecutionError } from '../lib/tools/tool-result';
import { shipmentStatusSchema } from '../schemas/shipment/shipment.schemas';
const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_ISSUE_LIMIT = 20;
function assertShipmentStatus(status) {
    const parsed = shipmentStatusSchema.safeParse(status);
    if (!parsed.success) {
        throw new ToolExecutionError(`不�?�な配送ス�?ータス: ${status}`, 'DATABASE_ERROR');
    }
    return parsed.data;
}
function toIsoString(value) {
    return value?.toISOString();
}
function buildUpdatedAtRange(fromDate, toDate) {
    if (!fromDate && !toDate) {
        return undefined;
    }
    return {
        ...(fromDate ? { gte: new Date(fromDate) } : {}),
        ...(toDate ? { lte: new Date(toDate) } : {}),
    };
}
export class ShipmentService {
    shipmentRepository;
    constructor(shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }
    async getShipmentStatus(trackingNumber) {
        const shipment = await this.shipmentRepository.findUnique({
            where: { trackingNumber },
        });
        if (!shipment) {
            throw new ToolExecutionError(`送り状番号 ${trackingNumber} の配送情報が見つかりません`, 'NOT_FOUND', { trackingNumber });
        }
        return {
            trackingNumber: shipment.trackingNumber,
            shipmentStatus: assertShipmentStatus(shipment.shipmentStatus),
            currentLocation: shipment.currentLocation ?? '不�??',
            origin: shipment.origin ?? undefined,
            destination: shipment.destination ?? undefined,
            customerName: shipment.customerName ?? undefined,
            estimatedArrival: toIsoString(shipment.eta),
            delayReason: shipment.delayReason ?? undefined,
            lastUpdatedAt: shipment.updatedAt.toISOString(),
        };
    }
    async searchShipmentHistory(input) {
        const limit = input.limit ?? DEFAULT_HISTORY_LIMIT;
        const updatedAt = buildUpdatedAtRange(input.fromDate, input.toDate);
        const where = {
            ...(input.trackingNumber
                ? {
                    trackingNumber: {
                        contains: input.trackingNumber,
                        mode: 'insensitive',
                    },
                }
                : {}),
            ...(input.customerName
                ? {
                    customerName: {
                        contains: input.customerName,
                        mode: 'insensitive',
                    },
                }
                : {}),
            ...(input.shipmentStatus ? { shipmentStatus: input.shipmentStatus } : {}),
            ...(updatedAt ? { updatedAt } : {}),
        };
        const [records, total] = await Promise.all([
            this.shipmentRepository.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                take: limit,
            }),
            this.shipmentRepository.count({ where }),
        ]);
        if (total === 0) {
            throw new ToolExecutionError('条件に一致する配送履歴が見つかりません', 'NO_RESULTS', { filters: input });
        }
        const mapped = records.map((shipment) => ({
            trackingNumber: shipment.trackingNumber,
            shipmentStatus: assertShipmentStatus(shipment.shipmentStatus),
            origin: shipment.origin ?? undefined,
            destination: shipment.destination ?? undefined,
            customerName: shipment.customerName ?? undefined,
            currentLocation: shipment.currentLocation ?? undefined,
            updatedAt: shipment.updatedAt.toISOString(),
        }));
        return { records: mapped, total };
    }
    async searchDeliveryIssues(input) {
        const limit = input.limit ?? DEFAULT_ISSUE_LIMIT;
        const updatedAt = buildUpdatedAtRange(input.fromDate, input.toDate);
        const issueStatuses = input.issueStatus
            ? [input.issueStatus]
            : ['DELAYED', 'CANCELLED'];
        const where = {
            shipmentStatus: { in: issueStatuses },
            ...(input.trackingNumber
                ? {
                    trackingNumber: {
                        contains: input.trackingNumber,
                        mode: 'insensitive',
                    },
                }
                : {}),
            ...(input.customerName
                ? {
                    customerName: {
                        contains: input.customerName,
                        mode: 'insensitive',
                    },
                }
                : {}),
            ...(updatedAt ? { updatedAt } : {}),
        };
        const records = await this.shipmentRepository.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: limit,
        });
        if (records.length === 0) {
            throw new ToolExecutionError('条件に一致する配送トラブル?��遅延・キャンセル?��が見つかりません', 'NO_RESULTS', { filters: input });
        }
        return records.map((shipment) => ({
            trackingNumber: shipment.trackingNumber,
            shipmentStatus: shipment.shipmentStatus,
            delayReason: shipment.delayReason ?? undefined,
            currentLocation: shipment.currentLocation ?? undefined,
            estimatedArrival: toIsoString(shipment.eta),
            customerName: shipment.customerName ?? undefined,
            lastUpdatedAt: shipment.updatedAt.toISOString(),
        }));
    }
}
