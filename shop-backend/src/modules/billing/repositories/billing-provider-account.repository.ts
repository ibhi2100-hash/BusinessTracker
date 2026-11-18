import { BillingProvider } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 

export class BillingProviderAccountRepository {

  async create(
    data: Prisma.BillingProviderAccountCreateInput,
    tx: DbClient
  ) {
    return tx.billingProviderAccount.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingProviderAccount.findUnique({
      where: { id },
    });
  }

  async findByProvider(
    provider: BillingProvider,
    tx: DbClient
  ) {
    return tx.billingProviderAccount.findMany({
      where: { provider },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActive(
    provider: BillingProvider,
    tx: DbClient,
    environment?: string,
    
  ) {
    return tx.billingProviderAccount.findFirst({
      where: {
        provider,
        isActive: true,
        ...(environment ? { environment } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingProviderAccountUpdateInput,
    tx: DbClient
  ) {
    return tx.billingProviderAccount.update({
      where: { id },
      data,
    });
  }

  async setActive(
    id: string,
    isActive: boolean,
    tx: DbClient
  ) {
    return tx.billingProviderAccount.update({
      where: { id },
      data: { isActive },
    });
  }

  async delete(id: string, tx: DbClient) {
    return tx.billingProviderAccount.delete({
      where: { id },
    });
  }
}
