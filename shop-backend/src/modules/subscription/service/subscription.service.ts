import { SubscriptionRepository } from "../repository/subscription.repository.js";
import { User } from "../../auth/entity/user.js";
import cron from "node-cron";
import axios from "axios";

export class SubscriptionService {
    constructor(private repo: SubscriptionRepository){}

    getSubscriptionPlan = async ()=> {
        const subscription  = await this.repo.getSubscriptionPlan();
        if(!subscription) throw new Error("Subscription does not exist for a business")

        return subscription;
    }
    createPlan = async (businessId: string, planId: string)=> {
        const result = await this.repo.create(businessId, planId);

        return result
    }
    initializeSubscriptionPayment = async (businessId: string, planId: string, user: User)=> {
        const plan = await this.repo.findPlanById(planId);
            if(!plan) throw new Error("Plan does not exist");

       try {
         const response = await axios.post(
           "https://api.paystack.co/transaction/initialize",
           {
             email: user.email,
             amount: Math.round(Number(plan!.price) * 100), // amount in kobo
             metadata: { businessId, planId }
           },
           {
             headers: {
               Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
               "Content-Type": "application/json"
             }
           }
         );
         console.log("Paystack initialization response:", response.data);
         return response.data;
         
       } catch (error: any) {
         console.log("Paystack error response:", error.response?.data);
         throw new Error(
           `Paystack initialization failed: ${error.response?.data?.message || error.message}`
         );
       }
    
    }
  verifyPayment = async (reference: string) => {
    try {
      // Verify transaction with Paystack
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          },
        }
      );

      const { status, amount, metadata } = response.data.data;

      if (status !== "success") {
        return { success: false, message: "Payment not successful" };
      }
      const subscription = await this.repo.verifyPayment(metadata);
      return { success: true };
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      return { success: false, message: "Payment verification failed" };
    }
};
    cronWorker = () => {
        cron.schedule("0 0 * * *", async () => {
            console.log("Running subscription expiration check...");
            await this.repo.checkExpiredSubscriptions();
        });
    }
}