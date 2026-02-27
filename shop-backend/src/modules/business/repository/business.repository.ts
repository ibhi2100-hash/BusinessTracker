import { prisma } from "../../../infrastructure/postgresql/prismaClient.js"

export class BusinessRepository{
    getBusinessData  = async (businessId: string ) =>{
        return await prisma.business.findFirst({
            where: { id: businessId}
        })
    }

    findBusiness(businessId: string) {
    return prisma.business.findUnique({
      where: { id: businessId }, 
      select: { id: true, name: true },
    });
  }

  findBranches(businessId: string) {
    return prisma.branch.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" }
    });
  }
  switchBranch = async (branchId: string, businessId: string )=>{
    return await prisma.branch.findFirst({
                where: { id: branchId , businessId }
  });
  }

  getBranchCategories = async (businessId: string, branchId: string)=> {
      return await prisma.category.findMany({
        where: { businessId, branchId}
      })
  }

 getBrandsByBusiness = async (businessId: string, categoryId: string) => {
  return prisma.brand.findMany({
    where: {
      businessId,
      categoryId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc"
    }
  });
}
}