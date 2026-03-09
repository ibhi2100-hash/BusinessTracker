import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import axios from "axios";
import { User } from "../../auth/entity/user.js";

export class SubscriptionRepository {
  findPlanById = async (planId: string) => {

    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        subscription: true
      }
    });

    return subscriptionPlan;
  };

  getSubscriptionPlan = async () => {

    const subscriptionPlan = await prisma.subscriptionPlan.findMany({
      include: {
        subscription: true
      }
    });

    return subscriptionPlan;
  };


create = async (businessId: string, subscriptionId: string) => {

  const expiresAt = new Date(
   Date.now() + 30 * 24 * 60 * 60 * 1000
 );

  const subscription = await prisma.businessSubscription.upsert({
    where: {
      businessId
    },
    update: {
      subscriptionId,
      status: "ACTIVE",
      startedAt: new Date(),
      expiresAt
    },
    create: {
      businessId,
      subscriptionId,
      startedAt: new Date(),
      expiresAt,
      status: "ACTIVE",
      trialEndDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      )
    }
  });

  return subscription;
};

verifyPayment = async (metadata: any)=> {
  // Activate subscription in your database
    const subscription = await prisma.businessSubscription.updateMany({
      where: { businessId: metadata.businessId, planId: metadata.planId },
      data: { status: "ACTIVE" },
    });
}
checkExpiredSubscriptions = async () => {

 const expired = await prisma.businessSubscription.findMany({

  where:{
    expiresAt:{
      lt:new Date()
    },
    status:"ACTIVE"
  }

 });

 for(const sub of expired){

   await prisma.businessSubscription.update({

     where:{ id:sub.id },

     data:{
       status:"EXPIRED"
     }

   })

 }

}
}