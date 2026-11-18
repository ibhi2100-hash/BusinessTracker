import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient

export class BillingProviderCustomerRepository {
  async create(
    data: Prisma.BillingProviderCustomerCreateInput,
    tx: DbClient
  ) {
    return tx.billingProviderCustomer.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingProviderCustomer.findUnique({
      where: { id },
      include: { account: true },
    });
  }

  async findByBusinessAndAccount(
    businessId: string,
    accountId: string,
    tx: DbClient
  ) {
    return tx.billingProviderCustomer.findFirst({
      where: { businessId, accountId },
      include: { account: true },
    });
  }

  async findByProviderCustomerId(
    accountId: string,
    providerCustomerId: string,
    tx: DbClient
  ) {
    return tx.billingProviderCustomer.findFirst({
      where: { accountId, providerCustomerId },
    });
  }

  async findByBusinessId(
    businessId: string,
    tx: DbClient
  ) {
    return tx.billingProviderCustomer.findMany({
      where: { businessId },
      include: { account: true },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingProviderCustomerUpdateInput,
    tx: DbClient
  ) {
    return tx.billingProviderCustomer.update({
      where: { id },
      data,
    });
  }

  async upsert(
    businessId: string,
    accountId: string,
    data: {
      providerCustomerId: string;
      email?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
    tx: DbClient
  ) {
    const existing = await this.findByBusinessAndAccount(
      businessId,
      accountId,
      tx
    );

    if (existing) {
      return tx.billingProviderCustomer.update({
        where: { id: existing.id },
        data: {
          providerCustomerId: data.providerCustomerId,
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
        },
      });
    }

    return tx.billingProviderCustomer.create({
      data: {
        business: { connect: { id: businessId } },
        account: { connect: { id: accountId } },
        providerCustomerId: data.providerCustomerId,
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
      },
    });
  }

  async delete(id: string, tx: DbClient) {
    return tx.billingProviderCustomer.delete({
      where: { id },
    });
  }
}
