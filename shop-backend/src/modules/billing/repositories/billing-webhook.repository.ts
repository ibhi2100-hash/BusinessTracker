import { BillingProvider, BillingWebhookStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient

export class BillingWebhookRepository {

  async create(
    data: Prisma.BillingProviderWebhookEventCreateInput,
    tx: DbClient
  ) {
    return tx.billingProviderWebhookEvent.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingProviderWebhookEvent.findUnique({
      where: { id },
      include: { account: true },
    });
  }

  async findByProviderEventId(
    provider: BillingProvider,
    providerEventId: string,
    tx: DbClient
  ) {
    return tx.billingProviderWebhookEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider,
          providerEventId,
        },
      },
    });
  }

  async receive(
    data: Prisma.BillingProviderWebhookEventCreateInput,
    tx: DbClient
  ) {
    return tx.billingProviderWebhookEvent.create({ data });
  }

  async markProcessing(id: string, tx: DbClient) {
    return tx.billingProviderWebhookEvent.update({
      where: { id },
      data: {
        status: BillingWebhookStatus.PROCESSING,
        processingAttempts: { increment: 1 },
      },
    });
  }

  async markProcessed(id: string, tx: DbClient) {
    return tx.billingProviderWebhookEvent.update({
      where: { id },
      data: {
        status: BillingWebhookStatus.PROCESSED,
        processedAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailed(
    id: string,
    error: string,
    tx: DbClient
  ) {
    return tx.billingProviderWebhookEvent.update({
      where: { id },
      data: {
        status: BillingWebhookStatus.FAILED,
        lastError: error,
      },
    });
  }

  async markIgnored(id: string, tx: DbClient) {
    return tx.billingProviderWebhookEvent.update({
      where: { id },
      data: {
        status: BillingWebhookStatus.IGNORED,
        processedAt: new Date(),
      },
    });
  }

  async findRetryable(take = 100) {
    return prisma.billingProviderWebhookEvent.findMany({
      where: {
        status: {
          in: [
            BillingWebhookStatus.RECEIVED,
            BillingWebhookStatus.FAILED,
          ],
        },
      },
      take,
      orderBy: { receivedAt: "asc" },
    });
  }

  async findByStatus(
    status: BillingWebhookStatus,
    take = 100
  ) {
    return prisma.billingProviderWebhookEvent.findMany({
      where: { status },
      take,
      orderBy: { receivedAt: "asc" },
    });
  }

  async countByStatus(status: BillingWebhookStatus) {
    return prisma.billingProviderWebhookEvent.count({
      where: { status },
    });
  }
}
