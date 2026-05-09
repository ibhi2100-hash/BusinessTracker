import { signTokenWithExpiry } from "../../../helpers/jwtHelper/jwthelper.js";
import { BusinessRepository } from "../repository/business.repository.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Events } from "../../../domain/event.js";
export class BusinessService {
    constructor(private repo: BusinessRepository){}

    getBusinessData = async(businessId: string)=> {
        return await this.repo.getBusinessData(businessId)
    }

getSwitchedBranch = async (userId: string, branchId: string, businessId: string,   role: string)=> {
  if(!branchId) throw new Error("branchId does not exist")
  const branch = await this.repo.switchBranch(branchId, businessId)

  const {token, expiresIn} = signTokenWithExpiry(userId, role, businessId, branchId)

  return {branch, token, expiresIn}

}
async activateBusiness(event: Events) {

    return prisma.$transaction(async (tx) => {

        const business = await tx.business.findUnique({
            where: { id: event.businessId}
        });

        if (!business) {
            throw new Error("Business not found");
        }

        if (!business.isOnboarding) {
            throw new Error("Business already activated");
        }
        if(business.status === "ACTIVE") {
          throw new Error (" Business is Already active")
        }

        

        // Optional: ensure at least one stock record exists
        const products = await tx.products.findFirst({
            where: { businessId: event.businessId }
        });

        if (!products) {
            throw new Error("Stock at hand must be added before activation");
        }


        // Flip lifecycle state
        await tx.business.update({
            where: { id: event.businessId},
            data: { isOnboarding: false, status: "ACTIVE", activatedAt: Date.now() }
        });

        return { message: "Business activated successfully" };
    });
}
}