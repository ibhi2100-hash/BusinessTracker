import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { Events } from "../../../domain/event.js";
import { getEventScope } from "../../../lib/getEventScoped.js";


export class SyncRepository {

async findExistingEvent(eventId: string, tx: Prisma.TransactionClient) {
    return tx.event.findUnique({
      where: { id: eventId }
    });
  }

async findEventAfterSnapshotVersion(
  event: Events,
  version: number
) {
  const scope = getEventScope(event);

  let where: any = {
    version: { gt: version },
    scope
  };

  if (scope === "BUSINESS") {
    where.businessId = event.businessId;
  }

  if (scope === "BRANCH") {
    where.businessId = event.businessId;
    where.branchId = event.branchId;
  }

  return prisma.event.findMany({
    where,
    orderBy: { version: "asc" }
  });
}

async storeEvents(event: Events, tx: Prisma.TransactionClient) {
  const existing = await tx.event.findUnique({
    where: { id: event.id }
  });

  if (existing) return existing;

  await this.validateLogicClock(event, tx);

  for (let i = 0; i < 3; i++) {
    try {
      const version = await this.getNextVersion(event, tx);

      return await tx.event.create({
        data: {
          id: event.id,
          type: event.type,
          payload: event.payload,

          scope: getEventScope(event),

          businessId: event.businessId,
          branchId: event.branchId,
          mode: event.mode,

          createdAt: new Date(event.createdAt),
          logicClock: event.logicClock,
          version,

          deviceId: event.deviceId,
          userId: event.userId ?? null,

          status: "SYNCED",
          synced: true
        }
      });

    } catch (err: any) {
      if (err.code === "P2002") continue; // retry on unique violation
      throw err;
    }
  }

  throw new Error("Failed to assign version after retries");
}

  async createLedger(
    entries: any[],
    businessId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.ledgerEntry.createMany({
      data: entries.map(e => ({
        ...e,
        businessId
      })),
      skipDuplicates: true // ✅ CRITICAL
    });
  }

  async updateAccountSnapshots(
    branchId: string,
    tx: Prisma.TransactionClient
  ) {

    const grouped = await tx.ledgerEntry.groupBy({
      by: ["account"],
      where: { branchId },
      _sum: { amount: true }
    });

    for (const g of grouped) {
      await tx.snapshot.upsert({
        where: {
          branchId_account: {
            branchId,
            account: g.account
          }
        },
        update: {
          balance: g._sum.amount ?? 0
        },
        create: {
          branchId,
          account: g.account,
          balance: g._sum.amount ?? 0
        }
      });
    }
  }

  async markProcessed(event: Events, tx: Prisma.TransactionClient) {
    return tx.processedSyncEvent.upsert({
      where: { id: event.id },
      update: {
        status: "SYNCED",
        error: null
      },
      create: {
        id: event.id,
        eventType: event.type,
        businessId: event.businessId,
        branchId: event.branchId ?? null,
        userId: event.userId ?? null,
        version: event.version,
        status: "SYNCED"
      }
    });
  }

  async markFailed(event: Events, error: string) {
    return prisma.processedSyncEvent.upsert({
      where: { id: event.id },
      update: {
        status: "FAILED",
        error
      },
      create: {
        id: event.id,
        eventType: event.type,
        businessId: event.businessId ?? null,
        branchId: event.branchId ?? null,
        userId: event.userId ?? null,
        version: event.version,
        status: "FAILED",
        error
      }
    });
  }

async validateLogicClock(event: Events, tx: Prisma.TransactionClient) {
  const last = await tx.event.findFirst({
    where: { deviceId: event.deviceId },
    orderBy: { logicClock: "desc" }
  });

 if (last && event.logicClock === last.logicClock) {
  throw new Error("Duplicate logicClock for device");
}
}

async getNextVersion(event: Events, tx: Prisma.TransactionClient) {
  const scope = getEventScope(event);

  let where: any = {};

  if (scope === "GLOBAL") {
    // no filters → global stream
  }

  if (scope === "BUSINESS") {
    if (!event.businessId) {
      throw new Error("BUSINESS scope requires businessId");
    }

    where.businessId = event.businessId;
  }

  if (scope === "BRANCH") {
    if (!event.businessId || !event.branchId) {
      throw new Error("BRANCH scope requires businessId + branchId");
    }

    where.businessId = event.businessId;
    where.branchId = event.branchId;
  }

  const last = await tx.event.findFirst({
    where,
    orderBy: { version: "desc" }
  });

  return (last?.version ?? 0) + 1;
}
async alreadyProcessed(eventId: string, tx: Prisma.TransactionClient) {
  return tx.processedSyncEvent.findUnique({
    where: { id: eventId }
  });
}
}