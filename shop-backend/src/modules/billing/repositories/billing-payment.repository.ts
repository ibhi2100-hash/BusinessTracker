import { BillingPaymentStatus } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


type DbClient = Prisma.TransactionClient

export class BillingPaymentRepository {

  async create(
    data: Prisma.BillingPaymentCreateInput,
    tx: DbClient
  ) {
    return tx.billingPayment.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingPayment.findUnique({
      where: { id },
      include: {
        attempts: true,
        allocations: {
          include: { invoice: true },
        },
        refunds: true,
      },
    });
  }

  async findByProviderReference(
    providerReference: string,
    tx: DbClient
  ) {
    return tx.billingPayment.findFirst({
      where: { providerReference },
      include: {
        attempts: true,
        allocations: true,
        refunds: true,
      },
    });
  }

  async findByBusinessId(
    businessId: string,
    params?: {
      status?: BillingPaymentStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const { status, skip = 0, take = 20 } = params ?? {};

    return prisma.billingPayment.findMany({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        attempts: true,
        allocations: true,
        refunds: true,
      },
    });
  }

  async findBySubscriptionId(
    subscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingPayment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingPaymentUpdateInput,
    tx: DbClient
  ) {
    return tx.billingPayment.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: BillingPaymentStatus,
    tx: DbClient
  ) {
    return tx.billingPayment.update({
      where: { id },
      data: { status },
    });
  }

  async markConfirmed(
    id: string,
    tx: DbClient
  ) {
    return tx.billingPayment.update({
      where: { id },
      data: {
        status: BillingPaymentStatus.CONFIRMED,
      },
    });
  }

  async markFailed(
    id: string,
    failureReason: string,
    tx: DbClient
  ) {
    return tx.billingPayment.update({
      where: { id },
      data: {
        status: BillingPaymentStatus.FAILED,
        failureReason,
      },
    });
  }

  async findPending(take = 100) {
    return prisma.billingPayment.findMany({
      where: {
        status: {
          in: [
            BillingPaymentStatus.INITIATED,
            BillingPaymentStatus.PENDING,
          ],
        },
      },
      take,
      orderBy: { createdAt: "asc" },
    });
  }

  async countByBusinessId(
    businessId: string,
    status?: BillingPaymentStatus
  ) {
    return prisma.billingPayment.count({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
    });
  }
}
