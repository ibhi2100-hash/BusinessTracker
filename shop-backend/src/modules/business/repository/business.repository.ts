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

getBusinessStatus = async ( businessId: string)=> {
  return prisma.business.findUnique({
    where: {
      id: businessId,
    }
  })
}
getBusinessSetupStatus = async ( businessId: string)=> {
  const openingCash = await prisma.cashFlow.count({
    where: { businessId, isOpening: true}
  });

  const inventory = await prisma.product.count({
    where: { businessId, stockMode: "OPENING"}
  });

  const asset = await prisma.asset.count({
    where: { businessId}
  });

  const liabilities = await prisma.liability.count({
    where: { businessId}
  });

  const steps = {
    openingCash: openingCash > 0,
    inventory: inventory > 0,
    assets: asset > 0,
    liabilities: liabilities > 0,
  };

  const completed = Object.values(steps).filter(Boolean).length;
  const percentage = Math.round((completed / 4) *100);

  return {
    steps,
    percentage,
    canActivate: percentage === 100
  }
}
}