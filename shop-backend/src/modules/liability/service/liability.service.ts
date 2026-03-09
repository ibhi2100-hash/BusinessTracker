import { LiabilityRepository } from "../repository/liability.repository.js";
import { CreateLiabilityDto } from "../dto/create-liability.dto.js";
import { RepayLiabilityDto } from "../dto/repay-liability.dto.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CashflowRepository } from "../../cashflow/repository/cashflow.repository.js";
import { CashFlowType, LiabilityType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { LiabilityCreateInput } from "../dto/liabilityCreate.dto.js";
import { connect } from "node:http2";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class LiabilityService {
    constructor(
        private liabilityRepo: LiabilityRepository,
        private cashflowRepo: CashflowRepository
    ){}

  /**
   * Create a new liability for a business
   */


createLiability(
    businessId: string,
    branchId: string,
    dto: LiabilityCreateInput
  ) {

  if (dto.principalAmount <= 0) {
    throw new Error("Principal amount must be greater than zero");
  }

  // Default start/due dates
  const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
  const dueDate = dto.dueDate ? new Date(dto.dueDate) : null; // null is valid if no due date

  const outstandingAmount = dto.principalAmount; // initially equals principal

return prisma.$transaction(async (tx: Prisma.TransactionClient) => {  

  const liability = await this.liabilityRepo.create(businessId, branchId, {
    title: dto.title,
    type: dto.type,
    principalAmount: dto.principalAmount,
    interestRate: dto.interestRate ?? null,
    startDate,
    dueDate,
    outstandingAmount,
    status: "ACTIVE",
  }, tx);

  await this.cashflowRepo.create({
    business: { connect: { id: businessId}},
    branch: { connect: { id: branchId}},
    type: "LIABILITY_PAYMENT",
    amount: outstandingAmount,
    direction: "IN",
    isOpening: false,
    description: "Liability adding to the cashflow"


  }, tx)

  });
}

  /**
   * Repay an existing liability
   */
  async repayLiability(
    liabilityId: string,
    businessId: string,
    branchId: string,
    dto: RepayLiabilityDto
  ) {
    return prisma.$transaction(async (tx) => {
      const liability = await this.liabilityRepo.findById(liabilityId, businessId);
      if (!liability) {
        throw new Error("Liability not found or already settled");
      }

      if (dto.amount <= 0) {
        throw new Error("Repayment amount must be greater than zero");
      }

      const outstanding = liability.outstandingAmount.toNumber();

      if (dto.amount > outstanding) {
        throw new Error("Repayment exceeds outstanding balance");
      }

      // 🔹 Calculate new outstanding
      const newOutstanding = outstanding - dto.amount;

      // Record repayment
      await this.liabilityRepo.recordLiabilityPayment(
        liabilityId,
        { amount: dto.amount, paymentDate: dto.paymentDate ?? new Date() },
        tx
      );

      // Update liability outstanding
      await this.liabilityRepo.updateLiability(liability.id, newOutstanding, tx);

      // Record cashflow outflow
      await this.cashflowRepo.create( 
        {   business: { connect: { id: businessId}},
            branch: { connect: { id: branchId}},
            type: "LIABILITY_PAYMENT",
            direction: "OUT",
            amount: dto.amount,
            source: "LIABILITY_REPAYMENT",
            description: `Repayment for ${liability.title}`,
            isOpening: false,
            
        },
        tx
      );

      return { newOutstanding };
    });
  }

  /**
   * List all liabilities for a business
   */
  async listLiabilities(businessId: string) {
    return this.liabilityRepo.list(businessId);
  }
}