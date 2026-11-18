
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 

export class BillingProviderSubscriptionRepository {

  async create(
    data: Prisma.BillingProviderSubscriptionCreateInput,
    tx: DbClient
  ) {
    return tx.billingProviderSubscription.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingProviderSubscription.findUnique({
      where: { id },
      include: { subscription: true, account: true },
    });
  }

  async findBySubscriptionId(
    subscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingProviderSubscription.findMany({
      where: { subscriptionId },
      include: { account: true },
    });
  }

  async findByProviderReference(
    accountId: string,
    providerSubscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingProviderSubscription.findFirst({
      where: {
        accountId,
        providerSubscriptionId,
      },
      include: { subscription: true },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingProviderSubscriptionUpdateInput,
    tx: DbClient 
  ) {
    return tx.billingProviderSubscription.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: string,
    tx: DbClient
  ) {
    return tx.billingProviderSubscription.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string, tx: DbClient) {
    return tx.billingProviderSubscription.delete({
      where: { id },
    });
  }
}
