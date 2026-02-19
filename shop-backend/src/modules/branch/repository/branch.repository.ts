import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
export class BranchRepository {
    async getBusinessBranches( businessId: string){
        return await prisma.branch.findMany({
            where: { businessId }
        })
    }
    findBusinessBranch = async ( businessId: string, name: string)=> {
        return await prisma.branch.findMany({
            where: {
                businessId,
                name: name
            }
        });
    }

    async createBranch(businessId: string, dto: {
        name: string,
        address?: string,
        phone?: string
    }) {
        return await prisma.branch.create({
            data: {
                businessId: businessId,
                name: dto.name,
                address: dto.address ?? null, 
                phone: dto.phone ?? null
            }
        })
    }
}