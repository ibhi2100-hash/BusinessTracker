import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


type DbClient = Prisma.TransactionClient 

export class BillingPaymentAllocationRepository {

  async create(
    data: Prisma.BillingPaymentAllocationCreateInput,
    tx: DbClient
  ) {
    return tx.billingPaymentAllocation.create({ data });
  }

  async createMany(
    data: Prisma.BillingPaymentAllocationCreateManyInput[],
    tx: DbClient
  ) {
    return tx.billingPaymentAllocation.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingPaymentAllocation.findUnique({
      where: { id },
      include: {
        payment: true,
        invoice: true,
      },
    });
  }

  async findByPaymentId(paymentId: string, tx: DbClient) {
    return tx.billingPaymentAllocation.findMany({
      where: { paymentId },
      include: { invoice: true },
    });
  }

  async findByInvoiceId(invoiceId: string, tx: DbClient) {
    return tx.billingPaymentAllocation.findMany({
      where: { invoiceId },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByPaymentAndInvoice(
    paymentId: string,
    invoiceId: string,
    tx: DbClient
  ) {
    return tx.billingPaymentAllocation.findUnique({
      where: {
        paymentId_invoiceId: {
          paymentId,
          invoiceId,
        },
      },
    });
  }

  async sumAllocatedToInvoice(
    invoiceId: string,
    tx: DbClient
  ) {
    const result = await tx.billingPaymentAllocation.aggregate({
      where: { invoiceId },
      _sum: { amountMinor: true },
    });

    return result._sum.amountMinor ?? 0n;
  }

  async sumAllocatedFromPayment(
    paymentId: string,
    tx: DbClient
  ) {
    const result = await tx.billingPaymentAllocation.aggregate({
      where: { paymentId },
      _sum: { amountMinor: true },
    });

    return result._sum.amountMinor ?? 0n;
  }

  async delete(
    id: string,
    tx: DbClient
  ) {
    return tx.billingPaymentAllocation.delete({
      where: { id },
    });
  }
}
