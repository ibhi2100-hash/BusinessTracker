import { BillingServiceRegistry } from "./billingServiceRegistry.js";
import { BillingPlanController } from "./controllers/billing-plan.controller.js";

export class BillingControllerRegistry {
    readonly billingPlanController: BillingPlanController

    constructor(
        private readonly services: BillingServiceRegistry
    ){
        this.billingPlanController = 
            new BillingPlanController(
                this.services.billingPlanService
            )
    }




}