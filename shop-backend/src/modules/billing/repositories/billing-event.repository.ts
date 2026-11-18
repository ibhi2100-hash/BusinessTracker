import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 
export class BillingEventRepository {

  async create(
    data: Prisma.BillingEventCreateInput,
    tx: DbClient
  ) {
    return tx.billingEvent.create({ data });
  }

  async findById(id: string, tx: DbClient ) {
    return tx.billingEvent.findUnique({
      where: { id },
    });
  }

  async findByAggregateVersion(
    aggregateType: string,
    aggregateId: string,
    aggregateVersion: number,
    tx: DbClient
  ) {
    return tx.billingEvent.findUnique({
      where: {
        aggregateType_aggregateId_aggregateVersion: {
          aggregateType,
          aggregateId,
          aggregateVersion,
        },
      },
    });
  }

  async findByAggregate(
    aggregateType: string,
    aggregateId: string,
    params?: {
      afterVersion?: number;
      take?: number;
    }
  ) {
    const { afterVersion = 0, take = 100 } = params ?? {};

    return prisma.billingEvent.findMany({
      where: {
        aggregateType,
        aggregateId,
        aggregateVersion: { gt: afterVersion },
      },
      take,
      orderBy: { aggregateVersion: "asc" },
    });
  }

  async findByBusinessId(
    businessId: string,
    params?: {
      aggregateType?: string;
      skip?: number;
      take?: number;
    }
  ) {
    const {
      aggregateType,
      skip = 0,
      take = 50,
    } = params ?? {};

    return prisma.billingEvent.findMany({
      where: {
        businessId,
        ...(aggregateType ? { aggregateType } : {}),
      },
      skip,
      take,
      orderBy: { occurredAt: "desc" },
    });
  }

  async findLatestByAggregate(
    aggregateType: string,
    aggregateId: string,
    tx: DbClient
  ) {
    return tx.billingEvent.findFirst({
      where: { aggregateType, aggregateId },
      orderBy: { aggregateVersion: "desc" },
    });
  }

  async countByAggregate(
    aggregateType: string,
    aggregateId: string
  ) {
    return prisma.billingEvent.count({
      where: { aggregateType, aggregateId },
    });
  }
}
