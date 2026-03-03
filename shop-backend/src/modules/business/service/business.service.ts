import { signTokenWithExpiry } from "../../../helpers/jwtHelper/jwthelper.js";
import { BusinessRepository } from "../repository/business.repository.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
export class BusinessService {
    constructor(private repo: BusinessRepository){}

    getBusinessData = async(businessId: string)=> {
        return await this.repo.getBusinessData(businessId)
    }

      async getBusinessContext(user: any) {
    const business = await this.repo.findBusiness(user.businessId);
    if(!business){
      throw new Error("Business not found")
    }
    const branches = await this.repo.findBranches(user.businessId);

    return {
      user: {
        id: user.id,
        role: user.role,
      },

      business: {
        id: business.id,
        name: business.name,
      },

      branches,

      permissions: this.buildPermissions(user.role),
    };
  }

  private buildPermissions(role: string) {
    if (role === "ADMIN") {
      return ["manage_products", "view_reports", "manage_staff"];
    }

    return ["create_sales", "view_products"];
}
getSwitchedBranch = async (userId: string, branchId: string, businessId: string,   role: string)=> {
  if(!branchId) throw new Error("branchId does not exist")
  const branch = await this.repo.switchBranch(branchId, businessId)

  const {token, expiresIn} = signTokenWithExpiry(userId, role, businessId, branchId)

  return {branch, token, expiresIn}

}
getBranchCategory = async (businessId: string, branchId: string)=> {
  if(!branchId) throw new Error("BranchID does not exist")

    const categories = await this.repo.getBranchCategories(businessId, branchId)

    return categories;
}
getBrandsByCategory = async ( businessId: string, categoryId: string )=> {
  
  const brands = await this.repo.getBrandsByBusiness( businessId, categoryId)
  return brands
}

async activateBusiness(businessId: string) {

    return prisma.$transaction(async (tx) => {

        const business = await tx.business.findUnique({
            where: { id: businessId }
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

        // Ensure opening cash exists
        const openingCash = await tx.cashFlow.findFirst({
            where: {
                businessId,
                isOpening: true,
                type: "OPENING",
            }
        });

        if (!openingCash) {
            throw new Error("Opening cash must be recorded before activation");
        }

        // Optional: ensure at least one stock record exists
        const inventory = await tx.product.findFirst({
            where: { businessId }
        });

        if (!inventory) {
            throw new Error("Stock at hand must be added before activation");
        }

        // Lock all opening entries
        await tx.cashFlow.updateMany({
            where: {
                businessId,
                isOpening: true
            },
            data: {
                isLocked: true
            }
        });


        // Flip lifecycle state
        await tx.business.update({
            where: { id: businessId },
            data: { isOnboarding: false, status: "ACTIVE" }
        });

        return { message: "Business activated successfully" };
    });
}

getBusinessStatus = async (businessId: string)=> {
  return await this.repo.getBusinessStatus(businessId)
}
getBusinessSetupStatus = async (businessId: string)=> {
  return await this.repo.getBusinessSetupStatus(businessId)
}
}