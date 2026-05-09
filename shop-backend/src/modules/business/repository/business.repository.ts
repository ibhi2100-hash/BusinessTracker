import { Event } from "../../../domain/event.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
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
    });
  }
  async createBusiness(event: Event, tx: Prisma.TransactionClient){
    const { id, name, address } = event.payload;

    const businessCreated = await tx.business.create({
      data: {
        id,
        name,
        address,
        ...(event.userId ? { owner: { connect: { id: event.userId } } } : {}),
        createdAt: new Date(event.createdAt),
        isOnboarding: true,
        onboardingCompleted: false,
        status: "ONBOARDING"
      }
    });

    return businessCreated;
  }

  async createBranch(event: Event, tx: Prisma.TransactionClient){
    const { id, businessId, name, phone } = event.payload
    const branchCreated = await tx.branch.create({
      data: {
        id,
        name,
        phone,
        businessId,
        isActive: true,
        isDefault: true,
        createdAt: new Date(event.createdAt)
      }
    });

    return branchCreated;
  }
  async activateBusiness(event: Event, tx: Prisma.TransactionClient){
    if(!event.businessId) return;
    const existing = await tx.business.findUnique({
      where: { id: event.businessId }
    });
    if(existing){
      await tx.business.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          isOnboarding: false,
          onboardingCompleted: true,
          activatedAt: new Date(event.createdAt)
        }
      });
    }
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


getBusinessStatus = async ( businessId: string)=> {
  return prisma.business.findUnique({
    where: {
      id: businessId,
    }
  })
}

}