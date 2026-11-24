import { BillingServiceRegistry } from "./billingServiceRegistry.js";
import { BillingPlanController } from "./controllers/billing-plan.controller.js";
import { BillingSubscriptionController } from "./controllers/billing-subscription.controller.js";

export class BillingControllerRegistry {
    readonly billingPlanController: BillingPlanController
    readonly billingSubscriptionController: BillingSubscriptionController;
    constructor(
        private readonly services: BillingServiceRegistry
    ){
        this.billingPlanController = 
            new BillingPlanController(
                this.services.billingPlanService
            );

        this.billingSubscriptionController = 
            new BillingSubscriptionController(
                this.services.billingSubscriptionService
            )
    }




}