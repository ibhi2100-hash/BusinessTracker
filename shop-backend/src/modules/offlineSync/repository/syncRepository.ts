import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { Events } from "../dto/event.js";

export class SyncRepository {

  async findExistingEvent(eventId: string, tx: Prisma.TransactionClient) {
    return tx.event.findUnique({
      where: { id: eventId }
    });
  }

 async storeEvent(event: Events, tx: Prisma.TransactionClient) {
  return tx.event.create({
    data: {
      id: event.id,
      type: event.type,
      payload: event.payload,

      businessId: event.businessId,
      branchId: event.branchId,
      userId: event.userId ?? null,

      createdAt: new Date(event.createdAt),
      syncedAt: new Date(),
    }
  });
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
      await tx.accountSnapshot.upsert({
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
        status: "PROCESSED",
        error: null
      },
      create: {
        id: event.id,
        eventType: event.type,
        businessId: event.businessId,
        branchId: event.branchId ?? null,
        userId: event.userId ?? null,
        version: event.version,
        status: "PROCESSED"
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
}