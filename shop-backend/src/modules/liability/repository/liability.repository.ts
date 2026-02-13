import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class LiabilityRepository {
    
    async create(businessId: string, data: any) {
        return await prisma.liability.create({
            data: {
                businessId,
                ...data,
            },
        });

    }

    async findById(id: string, businessId: string){
        return await prisma.liability.findFirst({
            where: {
                id,
                businessId,
                status: "ACTIVE"
            },
        });
    }

    async list (businessId:string){
        return await prisma.liability.findMany({
            where: {businessId},
            orderBy: { createdAt: "desc"}
        });
    }

    async updateAmounts(id: string, data: any ) {
        return await prisma.liability.update({
            where: {id},
            data
        });
    }

   async recordPayment(data: any) {
        return prisma.liabilityPayment.create({
            data
        })
    }

    async recordLiabilityPayment(liabilityId: string, data: any, tx: Prisma.TransactionClient){
        await tx.liabilityPayment.create({
            data: {
                liabilityId,
                amount: data.amount,
                paymentDate: data.paymentDate ?? new Date
            }
        })
    }

    async updateLiability (liabilityId:string, newOutstanding: number , tx: Prisma.TransactionClient){
        await tx.liability.update({
            where: {id: liabilityId },
            data: {
                outstandingAmount: newOutstanding,
                status: newOutstanding === 0 ? "SETTLED" : "ACTIVE"
            }
        })
    }



}