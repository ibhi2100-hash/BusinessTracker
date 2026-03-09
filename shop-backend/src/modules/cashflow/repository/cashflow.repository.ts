import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


export class CashflowRepository {

  async create(
    data: Prisma.CashFlowCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.cashFlow.create({ data });
  }

  async findByBranch(
    businessId: string,
    branchId: string
  ) {
    return prisma.cashFlow.findMany({
      where: { businessId, branchId },
      orderBy: { createdAt: "asc" }
    });
  }

  async findOpeningByBranch(
    businessId: string,
    branchId: string
  ) {
    return prisma.cashFlow.findFirst({
      where: {
        businessId,
        branchId,
        type: "OPENING"
      }
    });
  }

  async findByDateRange(
    businessId: string,
    branchId: string,
    start: Date,
    end: Date
  ) {
    return prisma.cashFlow.findMany({
      where: {
        businessId,
        branchId,
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });
  }
  async getAllCashflowRecord(businessId: string, branchId: string) {
    return await prisma.cashFlow.findMany({
        where: {businessId, branchId},
        orderBy: { createdAt: "desc"},
        take: 50
    })
  }
 
}