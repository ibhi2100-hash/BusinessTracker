import { LiabilityRepository } from "../repository/liability.repository.js";
import { CreateLiabilityDto } from "../dto/create-liability.dto.js";
import { RepayLiabilityDto } from "../dto/repay-liability.dto.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CashflowRepository } from "../../cashflow/repository/cashflow.repository.js";



export class LiabilityService {
    private liabilityRepo = new LiabilityRepository();
    private cashflow = new CashflowRepository();

    async creatLiability(businessId: string, dto: CreateLiabilityDto){
        if(dto.principalAmount <= 0) {
            throw new Error("Principal amount must be greater than zero")
        };

        return this.liabilityRepo.create(businessId, {
            title: dto.title,
            type: dto.type,
            principalAmount: dto.principalAmount,
            interestRate: dto.interestRate ?? null,
            startDate: dto.startDate ?? new Date(),
            dueDate: dto.dueDate ?? null,
            outstandingAmount: dto.principalAmount,
            status: "ACTIVE",
        });
    }

    async repayLiability(
        liabilityId: string,
        businessId: string,
        dto: RepayLiabilityDto
    ){
        return prisma.$transaction(async (tx) => {
            const liability = await this.liabilityRepo.findById(liabilityId, businessId);
            if(!liability){
                throw new Error("Liability not found or already settled")
            }

            if(dto.amount <= 0) {
                throw new Error("Repayment amount must be greater that zero");
            };
            const oustanding = liability.outstandingAmount.toNumber();

            if(dto.amount > oustanding){
                throw new Error("Repayment exceeds outstanding balance")
            }
             
            const newOutstanding = 
                    oustanding - dto.amount;

            await this.liabilityRepo.recordLiabilityPayment(liabilityId, {amount:dto.amount, paymentDate: dto.paymentDate}, tx);

            await this.liabilityRepo.updateLiability(liability.id, newOutstanding, tx);


            await this.cashflow.outflow({
                businessId,
                type: "OUTFLOW",
                amount: dto.amount,
                source: "LIABILITY_REPAYMENT",
                description: `Repayment for ${liability.title}`
            }, tx);

            return { newOutstanding }
        });
    }

    async listLiabilities(businessId: string){
        return this.liabilityRepo.list(businessId)
    }
}