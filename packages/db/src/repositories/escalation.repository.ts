import type { PrismaClient } from "@prisma/client";

import type { DbExecutor } from "../types/db-executor.js";
import { BaseRepository } from "./base.repository.js";

type EscalationDelegate = PrismaClient["escalationLog"];

export class EscalationRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findUnique(
    args: Parameters<EscalationDelegate["findUnique"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["findUnique"]> {
    return this.exec(tx).escalationLog.findUnique(args);
  }

  findFirst(
    args?: Parameters<EscalationDelegate["findFirst"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["findFirst"]> {
    return this.exec(tx).escalationLog.findFirst(args);
  }

  findMany(
    args?: Parameters<EscalationDelegate["findMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["findMany"]> {
    return this.exec(tx).escalationLog.findMany(args);
  }

  create(
    args: Parameters<EscalationDelegate["create"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["create"]> {
    return this.exec(tx).escalationLog.create(args);
  }

  createMany(
    args: Parameters<EscalationDelegate["createMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["createMany"]> {
    return this.exec(tx).escalationLog.createMany(args);
  }

  update(
    args: Parameters<EscalationDelegate["update"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["update"]> {
    return this.exec(tx).escalationLog.update(args);
  }

  updateMany(
    args: Parameters<EscalationDelegate["updateMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["updateMany"]> {
    return this.exec(tx).escalationLog.updateMany(args);
  }

  upsert(
    args: Parameters<EscalationDelegate["upsert"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["upsert"]> {
    return this.exec(tx).escalationLog.upsert(args);
  }

  delete(
    args: Parameters<EscalationDelegate["delete"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["delete"]> {
    return this.exec(tx).escalationLog.delete(args);
  }

  deleteMany(
    args?: Parameters<EscalationDelegate["deleteMany"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["deleteMany"]> {
    return this.exec(tx).escalationLog.deleteMany(args);
  }

  count(
    args?: Parameters<EscalationDelegate["count"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["count"]> {
    return this.exec(tx).escalationLog.count(args);
  }

  aggregate(
    args: Parameters<EscalationDelegate["aggregate"]>[0],
    tx?: DbExecutor,
  ): ReturnType<EscalationDelegate["aggregate"]> {
    return this.exec(tx).escalationLog.aggregate(args);
  }
}
