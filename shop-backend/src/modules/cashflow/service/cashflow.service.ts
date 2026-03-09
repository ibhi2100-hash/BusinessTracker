import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CashflowRepository } from "../repository/cashflow.repository.js";
import { CashFlowType, Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class CashflowService {
constructor (private cashflowRepo: CashflowRepository){}

private async getBranchBalance(
  businessId: string,
  branchId: string,
  tx: Prisma.TransactionClient
) {
  const result = await tx.cashFlow.groupBy({
    by: ["direction"],
    where: { businessId, branchId },
    _sum: { amount: true }
  });

  let inflow = 0;
  let outflow = 0;

  for (const row of result) {
    const value = Number(row._sum.amount ?? 0);
    if (row.direction === "IN") inflow = value;
    if (row.direction === "OUT") outflow = value;
  }

  return inflow - outflow;
}
    /**
     * Opening cash is allowed once per branch.
     */
    async addOpeningCash(
        businessId: string,
        branchId: string,
        amount: number
    ) {

        if (!businessId || !branchId) {
            throw new Error("Invalid business or branch reference");
        }

        if (typeof amount !== "number" || isNaN(amount)) {
            throw new Error("Amount must be a valid number");
        }

        if (amount <= 0) {
            throw new Error("Opening cash must be greater than zero");
        }

        // Ensure branch belongs to business
        const branch = await prisma.branch.findFirst({
            where: {
                id: branchId,
                businessId
            },
            select: { id: true }
        });

        if (!branch) {
            throw new Error("Branch not found or does not belong to business");
        }

        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

            // Prevent duplicate opening cash PER BRANCH
            const existingOpening = await tx.cashFlow.findFirst({
                where: {
                    businessId,
                    branchId,
                    isOpening: true,
                    source: "OPENING_BALANCE"
                }
            });

            if (existingOpening) {
                throw new Error("Opening cash already set for this branch");
            }

            return this.cashflowRepo.create({
                business: { connect: { id: businessId } },
                branch: { connect: { id: branchId } },
                type: "OPENING",
                direction: "IN",
                amount,
                source: "OPENING_BALANCE",
                description: "Initial branch cash balance",
                isOpening: true
            }, tx);

        });
    }

    /**
     * Returns inflow, outflow and net for a specific branch and date.
     */
    async getDailySummary(
        businessId: string,
        branchId: string,
        date: Date
    ) {

        if (!businessId || !branchId) {
            throw new Error("Invalid business or branch reference");
        }

        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const flows = await prisma.cashFlow.groupBy({
            by: ["direction"],
            where: {
                businessId,
                branchId,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            _sum: {
                amount: true
            }
        });

        let inflow = 0;
        let outflow = 0;

        for (const row of flows) {
            const value = Number(row._sum.amount ?? 0);

            if (row.direction === "IN") inflow = value;
            if (row.direction === "OUT") outflow = value;
        }

        return {
            date: start.toISOString().slice(0, 10),
            branchId,
            inflow,
            outflow,
            net: inflow - outflow
        };
    }

    async getCashflowInject (businessId: string, branchId: string) {
        return await this.cashflowRepo.findOpeningByBranch(businessId, branchId);
    }
    async getCashflowRecord (businessId: string, branchId: string){
        return await this.cashflowRepo.getAllCashflowRecord(businessId, branchId)
    }
    async injectCash(
    businessId: string,
    branchId: string,
    amount: number,
    type: CashFlowType,
    description?: string
    ) {

    if (amount <= 0) throw new Error("Amount must be greater than zero");

    return prisma.$transaction(async (tx) => {

        const balance = await this.getBranchBalance(businessId, branchId, tx);
        const newBalance = balance + amount;

        const typeStatus = type === "OPENING"

        return this.cashflowRepo.create({
        business: { connect: { id: businessId } },
        branch: { connect: { id: branchId } },
        type,
        direction: "IN",
        amount,
        balanceAfter: newBalance,
        description: description ?? null, // ✅ FIXED
        isOpening: typeStatus ? true : false
        }, tx);

    });
    }
    async withdrawCash(
    businessId: string,
    branchId: string,
    amount: number,
    type: CashFlowType,
    description?: string
    ) {

    if (amount <= 0) throw new Error("Amount must be greater than zero");

    return prisma.$transaction(async (tx) => {

        const balance = await this.getBranchBalance(businessId, branchId, tx);

        if (balance < amount) {
        throw new Error("Insufficient branch balance");
        }

        const newBalance = balance - amount;

        return this.cashflowRepo.create({
        business: { connect: { id: businessId } },
        branch: { connect: { id: branchId } },
        type,
        direction: "OUT", // 🔒 enforce direction
        amount,
        balanceAfter: newBalance,
        description: description ?? null, // ✅ FIXED
        isOpening: false
        }, tx);

    });
    }
}