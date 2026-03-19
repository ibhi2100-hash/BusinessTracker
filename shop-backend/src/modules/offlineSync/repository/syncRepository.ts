import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class SyncRepository {

  async isProcessed(eventId: string) {

    const event = await prisma.processedSyncEvent.findUnique({
      where: { id: eventId },
      select: { status: true }
    });

    return event?.status === "PROCESSED";
  }

  async markProcessed(event: any, tx?: Prisma.TransactionClient) {

    const db = tx ?? prisma;
    const isBusinessCreation = event.type === "BUSINESS_CREATED";

    return db.processedSyncEvent.upsert({
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
async markFailed(event: any, error: string) {

  const isBusinessCreation = event.type === "BUSINESS_CREATED";

  return prisma.processedSyncEvent.upsert({
    where: { id: event.id },

    update: {
      status: "FAILED",
      error
    },

    create: {
      id: event.id,
      eventType: event.type,

      // ✅ CRITICAL FIX
      businessId: isBusinessCreation ? null : event.businessId,

      branchId: event.branchId ?? null,
      userId: event.userId ?? null,
      version: event.version,
      status: "FAILED",
      error
    }
  });
}
}