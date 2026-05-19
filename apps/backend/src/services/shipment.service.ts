import type {
  DeliveryIssueRecord,
  GetShipmentStatusOutput,
  SearchDeliveryIssueInput,
  SearchDeliveryIssueOutput,
  SearchShipmentHistoryInput,
  SearchShipmentHistoryOutput,
  ShipmentHistoryRecord,
  ShipmentStatus,
} from '@inquiry-agent/shared-types';
import type { Prisma } from '@prisma/client';

import type { ShipmentRepository } from '../database/repositories/shipment.repository';
import { ToolExecutionError } from '../lib/tools/tool-result';
import { shipmentStatusSchema } from '../schemas/shipment/shipment.schemas';

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_ISSUE_LIMIT = 20;

type ShipmentWhereInput = Prisma.ShipmentWhereInput;

type ShipmentRecord = {
  trackingNumber: string;
  shipmentStatus: string;
  origin: string | null;
  destination: string | null;
  customerName: string | null;
  currentLocation: string | null;
  eta: Date | null;
  delayReason: string | null;
  updatedAt: Date;
};

function assertShipmentStatus(status: string): ShipmentStatus {
  const parsed = shipmentStatusSchema.safeParse(status);
  if (!parsed.success) {
    throw new ToolExecutionError(
      `不�?�な配送ス�?ータス: ${status}`,
      'DATABASE_ERROR',
    );
  }
  return parsed.data;
}

function toIsoString(value: Date | null | undefined): string | undefined {
  return value?.toISOString();
}

function buildUpdatedAtRange(
  fromDate?: string,
  toDate?: string,
): ShipmentWhereInput['updatedAt'] {
  if (!fromDate && !toDate) {
    return undefined;
  }

  return {
    ...(fromDate ? { gte: new Date(fromDate) } : {}),
    ...(toDate ? { lte: new Date(toDate) } : {}),
  };
}

export class ShipmentService {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  async getShipmentStatus(
    trackingNumber: string,
  ): Promise<GetShipmentStatusOutput> {
    const shipment = await this.shipmentRepository.findUnique({
      where: { trackingNumber },
    });

    if (!shipment) {
      throw new ToolExecutionError(
        `送り状番号 ${trackingNumber} の配送情報が見つかりません`,
        'NOT_FOUND',
        { trackingNumber },
      );
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

  async searchShipmentHistory(
    input: SearchShipmentHistoryInput,
  ): Promise<SearchShipmentHistoryOutput> {
    const limit = input.limit ?? DEFAULT_HISTORY_LIMIT;
    const updatedAt = buildUpdatedAtRange(input.fromDate, input.toDate);

    const where: ShipmentWhereInput = {
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
      throw new ToolExecutionError(
        '条件に一致する配送履歴が見つかりません',
        'NO_RESULTS',
        { filters: input },
      );
    }

    const mapped: ShipmentHistoryRecord[] = records.map(
      (shipment: ShipmentRecord) => ({
      trackingNumber: shipment.trackingNumber,
      shipmentStatus: assertShipmentStatus(shipment.shipmentStatus),
      origin: shipment.origin ?? undefined,
      destination: shipment.destination ?? undefined,
      customerName: shipment.customerName ?? undefined,
      currentLocation: shipment.currentLocation ?? undefined,
      updatedAt: shipment.updatedAt.toISOString(),
    }),
    );

    return { records: mapped, total };
  }

  async searchDeliveryIssues(
    input: SearchDeliveryIssueInput,
  ): Promise<SearchDeliveryIssueOutput> {
    const limit = input.limit ?? DEFAULT_ISSUE_LIMIT;
    const updatedAt = buildUpdatedAtRange(input.fromDate, input.toDate);
    const issueStatuses: string[] = input.issueStatus
      ? [input.issueStatus]
      : ['DELAYED', 'CANCELLED'];

    const where: ShipmentWhereInput = {
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
      throw new ToolExecutionError(
        '条件に一致する配送トラブル?��遅延・キャンセル?��が見つかりません',
        'NO_RESULTS',
        { filters: input },
      );
    }

    return records.map(
      (shipment: ShipmentRecord): DeliveryIssueRecord => ({
        trackingNumber: shipment.trackingNumber,
        shipmentStatus: shipment.shipmentStatus as DeliveryIssueRecord['shipmentStatus'],
        delayReason: shipment.delayReason ?? undefined,
        currentLocation: shipment.currentLocation ?? undefined,
        estimatedArrival: toIsoString(shipment.eta),
        customerName: shipment.customerName ?? undefined,
        lastUpdatedAt: shipment.updatedAt.toISOString(),
      }),
    );
  }
}
