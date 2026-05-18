import type { PrismaClient } from "@prisma/client";

import type { DbExecutor } from "../types/db-executor.js";
import { BaseRepository } from "./base.repository.js";

type InventoryDelegate = PrismaClient["inventory"];

export class InventoryRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findUnique(
    args: Parameters<InventoryDelegate["findUnique"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["findUnique"]> {
    return this.exec(tx).inventory.findUnique(args);
  }

  findFirst(
    args?: Parameters<InventoryDelegate["findFirst"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["findFirst"]> {
    return this.exec(tx).inventory.findFirst(args);
  }

  findMany(
    args?: Parameters<InventoryDelegate["findMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["findMany"]> {
    return this.exec(tx).inventory.findMany(args);
  }

  create(
    args: Parameters<InventoryDelegate["create"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["create"]> {
    return this.exec(tx).inventory.create(args);
  }

  createMany(
    args: Parameters<InventoryDelegate["createMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["createMany"]> {
    return this.exec(tx).inventory.createMany(args);
  }

  update(
    args: Parameters<InventoryDelegate["update"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["update"]> {
    return this.exec(tx).inventory.update(args);
  }

  updateMany(
    args: Parameters<InventoryDelegate["updateMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["updateMany"]> {
    return this.exec(tx).inventory.updateMany(args);
  }

  upsert(
    args: Parameters<InventoryDelegate["upsert"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["upsert"]> {
    return this.exec(tx).inventory.upsert(args);
  }

  delete(
    args: Parameters<InventoryDelegate["delete"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["delete"]> {
    return this.exec(tx).inventory.delete(args);
  }

  deleteMany(
    args?: Parameters<InventoryDelegate["deleteMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["deleteMany"]> {
    return this.exec(tx).inventory.deleteMany(args);
  }

  count(
    args?: Parameters<InventoryDelegate["count"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["count"]> {
    return this.exec(tx).inventory.count(args);
  }

  aggregate(
    args: Parameters<InventoryDelegate["aggregate"]>[0],
    tx?: DbExecutor,
  ): ReturnType<InventoryDelegate["aggregate"]> {
    return this.exec(tx).inventory.aggregate(args);
  }
}
