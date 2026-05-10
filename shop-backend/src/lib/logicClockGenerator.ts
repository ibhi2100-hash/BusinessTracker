import { Prisma } from "../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../infrastructure/postgresql/prismaClient.js";

export async function getNextLogicClock(deviceId: string): Promise<number> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const record = await tx.deviceClock.upsert({
      where: { deviceId },
      create: {
        deviceId,
        lastClock: 1,
      },
      update: {
        lastClock: { increment: 1 },
      },
    });

    return record.lastClock;
  });
}