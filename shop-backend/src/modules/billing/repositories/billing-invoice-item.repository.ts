import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 

export class BillingInvoiceItemRepository {

  async create(
    data: Prisma.BillingInvoiceItemCreateInput,
    tx: DbClient
  ) {
    return tx.billingInvoiceItem.create({ data });
  }

  async createMany(
    data: Prisma.BillingInvoiceItemCreateManyInput[],
    tx: DbClient
  ) {
    return tx.billingInvoiceItem.createMany({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingInvoiceItem.findUnique({
      where: { id },
    });
  }

  async findByInvoiceId(
    invoiceId: string,
    tx: DbClient
  ) {
    return tx.billingInvoiceItem.findMany({
      where: { invoiceId },
      orderBy: { createdAt: "asc" },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingInvoiceItemUpdateInput,
    tx: DbClient
  ) {
    return tx.billingInvoiceItem.update({
      where: { id },
      data,
    });
  }

  async delete(
    id: string,
    tx: DbClient
  ) {
    return tx.billingInvoiceItem.delete({
      where: { id },
    });
  }

  async deleteByInvoiceId(
    invoiceId: string,
    tx: DbClient
  ) {
    return tx.billingInvoiceItem.deleteMany({
      where: { invoiceId },
    });
  }
}
