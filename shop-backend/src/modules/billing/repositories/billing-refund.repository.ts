import { BillingRefundStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


type DbClient = Prisma.TransactionClient

export class BillingRefundRepository {

  async create(
    data: Prisma.BillingRefundCreateInput,
    tx: DbClient
  ) {
    return tx.billingRefund.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingRefund.findUnique({
      where: { id },
      include: { payment: true },
    });
  }

  async findByPaymentId(paymentId: string, tx: DbClient) {
    return tx.billingRefund.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByProviderReference(
    providerRefundReference: string,
    tx: DbClient
  ) {
    return tx.billingRefund.findFirst({
      where: { providerRefundReference },
      include: { payment: true },
    });
  }

  async findByBusinessId(
    businessId: string,
    params?: {
      status?: BillingRefundStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const { status, skip = 0, take = 20 } = params ?? {};

    return prisma.billingRefund.findMany({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { payment: true },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingRefundUpdateInput,
    tx: DbClient
  ) {
    return tx.billingRefund.update({
      where: { id },
      data,
    });
  }

  async markProcessing(id: string, tx: DbClient) {
    return tx.billingRefund.update({
      where: { id },
      data: {
        status: BillingRefundStatus.PROCESSING,
      },
    });
  }

  async markSuccessful(
    id: string,
    tx: DbClient,
    providerRefundReference?: string,
    
  ) {
    return tx.billingRefund.update({
      where: { id },
      data: {
        status: BillingRefundStatus.SUCCESS,
        processedAt: new Date(),
        ...(providerRefundReference
          ? { providerRefundReference }
          : {}),
      },
    });
  }

  async markFailed(id: string, tx: DbClient) {
    return tx.billingRefund.update({
      where: { id },
      data: {
        status: BillingRefundStatus.FAILED,
        processedAt: new Date(),
      },
    });
  }

  async findPending(take = 100) {
    return prisma.billingRefund.findMany({
      where: {
        status: {
          in: [
            BillingRefundStatus.PENDING,
            BillingRefundStatus.PROCESSING,
          ],
        },
      },
      take,
      orderBy: { requestedAt: "asc" },
    });
  }

  async sumSuccessfulRefunds(
    paymentId: string,
    tx: DbClient
  ) {
    const result = await tx.billingRefund.aggregate({
      where: {
        paymentId,
        status: BillingRefundStatus.SUCCESS,
      },
      _sum: { amountMinor: true },
    });

    return result._sum.amountMinor ?? 0n;
  }
}
