import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
export class BranchRepository {
    async getBusinessBranches( businessId: string){
        return await prisma.branch.findMany({
            where: { businessId }
        })
    }
}