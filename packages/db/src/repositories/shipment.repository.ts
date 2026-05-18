import type { PrismaClient } from "@prisma/client";

import type { DbExecutor } from "../types/db-executor.js";
import { BaseRepository } from "./base.repository.js";

type ShipmentDelegate = PrismaClient["shipment"];

export class ShipmentRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findUnique(
    args: Parameters<ShipmentDelegate["findUnique"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["findUnique"]> {
    return this.exec(tx).shipment.findUnique(args);
  }

  findFirst(
    args?: Parameters<ShipmentDelegate["findFirst"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["findFirst"]> {
    return this.exec(tx).shipment.findFirst(args);
  }

  findMany(
    args?: Parameters<ShipmentDelegate["findMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["findMany"]> {
    return this.exec(tx).shipment.findMany(args);
  }

  create(
    args: Parameters<ShipmentDelegate["create"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["create"]> {
    return this.exec(tx).shipment.create(args);
  }

  createMany(
    args: Parameters<ShipmentDelegate["createMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["createMany"]> {
    return this.exec(tx).shipment.createMany(args);
  }

  update(
    args: Parameters<ShipmentDelegate["update"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["update"]> {
    return this.exec(tx).shipment.update(args);
  }

  updateMany(
    args: Parameters<ShipmentDelegate["updateMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["updateMany"]> {
    return this.exec(tx).shipment.updateMany(args);
  }

  upsert(
    args: Parameters<ShipmentDelegate["upsert"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["upsert"]> {
    return this.exec(tx).shipment.upsert(args);
  }

  delete(
    args: Parameters<ShipmentDelegate["delete"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["delete"]> {
    return this.exec(tx).shipment.delete(args);
  }

  deleteMany(
    args?: Parameters<ShipmentDelegate["deleteMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["deleteMany"]> {
    return this.exec(tx).shipment.deleteMany(args);
  }

  count(
    args?: Parameters<ShipmentDelegate["count"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["count"]> {
    return this.exec(tx).shipment.count(args);
  }

  aggregate(
    args: Parameters<ShipmentDelegate["aggregate"]>[0],
    tx?: DbExecutor,
  ): ReturnType<ShipmentDelegate["aggregate"]> {
    return this.exec(tx).shipment.aggregate(args);
  }
}
