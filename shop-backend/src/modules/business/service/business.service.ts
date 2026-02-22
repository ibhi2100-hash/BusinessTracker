import { signToken } from "../../../helpers/jwtHelper/jwthelper.js";
import { BusinessRepository } from "../repository/business.repository.js";
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

  const token = signToken(userId, role, businessId, branchId)

  return {branch, token}

}
getBranchCategory = async (businessId: string, branchId: string)=> {
  if(!branchId) throw new Error("BranchID does not exist")

    const categories = await this.repo.getBranchCategories(businessId, branchId)

    return categories;
}
getBrandsByCategory = async (categoryId: string, businessId: string, branchId?: string )=> {
  if(!categoryId) throw new Error(" Category Id is required")

  const brands = await this.repo.getBrandsByCategory(categoryId, businessId, branchId)
  return brands
}
}