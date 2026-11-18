import { BillingInvoiceStatus } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


type DbClient = Prisma.TransactionClient

export class BillingInvoiceRepository {

  async create(
    data: Prisma.BillingInvoiceCreateInput,
    tx: DbClient
  ) {
    return tx.billingInvoice.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingInvoice.findUnique({
      where: { id },
      include: {
        items: true,
        allocations: {
          include: { payment: true },
        },
        subscription: true,
      },
    });
  }

  async findByInvoiceNumber(
    businessId: string,
    invoiceNumber: string,
    tx: DbClient
  ) {
    return tx.billingInvoice.findUnique({
      where: {
        businessId_invoiceNumber: {
          businessId,
          invoiceNumber,
        },
      },
      include: { items: true },
    });
  }

  async findByBusinessId(
    businessId: string,
    params?: {
      status?: BillingInvoiceStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const { status, skip = 0, take = 20 } = params ?? {};

    return prisma.billingInvoice.findMany({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async findBySubscriptionId(
    subscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingInvoice.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingInvoiceUpdateInput,
    tx: DbClient
  ) {
    return tx.billingInvoice.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: BillingInvoiceStatus,
    tx: DbClient
  ) {
    return tx.billingInvoice.update({
      where: { id },
      data: { status },
    });
  }

  async issue(
    id: string,
    dueAt: Date | null,
    tx: DbClient 
  ) {
    return tx.billingInvoice.update({
      where: { id },
      data: {
        status: BillingInvoiceStatus.ISSUED,
        issuedAt: new Date(),
        dueAt,
      },
    });
  }

  async markPaid(
    id: string,
    paidAt = new Date(),
    tx: DbClient 
  ) {
    return tx.billingInvoice.update({
      where: { id },
      data: {
        status: BillingInvoiceStatus.PAID,
        paidAt,
        amountDue: 0n,
      },
    });
  }

  async markOverdue(
    id: string,
    tx: DbClient
  ) {
    return tx.billingInvoice.updateMany({
      where: {
        id,
        status: {
          in: [
            BillingInvoiceStatus.ISSUED,
            BillingInvoiceStatus.PARTIALLY_PAID,
          ],
        },
        dueAt: { lte: new Date() },
      },
      data: {
        status: BillingInvoiceStatus.OVERDUE,
      },
    });
  }

  async findOverdue(now = new Date(), take = 100) {
    return prisma.billingInvoice.findMany({
      where: {
        status: {
          in: [
            BillingInvoiceStatus.ISSUED,
            BillingInvoiceStatus.PARTIALLY_PAID,
            BillingInvoiceStatus.OVERDUE,
          ],
        },
        dueAt: { lte: now },
        amountDue: { gt: 0n },
      },
      take,
      orderBy: { dueAt: "asc" },
    });
  }

  async findUnpaidByBusinessId(businessId: string) {
    return prisma.billingInvoice.findMany({
      where: {
        businessId,
        status: {
          in: [
            BillingInvoiceStatus.ISSUED,
            BillingInvoiceStatus.PARTIALLY_PAID,
            BillingInvoiceStatus.OVERDUE,
          ],
        },
        amountDue: { gt: 0n },
      },
      orderBy: { dueAt: "asc" },
    });
  }

  async countByBusinessId(
    businessId: string,
    status?: BillingInvoiceStatus
  ) {
    return prisma.billingInvoice.count({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
    });
  }
}
