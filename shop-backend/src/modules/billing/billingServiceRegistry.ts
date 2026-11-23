import { BillingRepositoryRegistry } from "./billingRepositoryRegistry.js";
import { BillingEntitlementService } from "./service/billing-entitlement.service.js";
import { BillingPlanService } from "./service/billing-plan.service.js";

export class BillingServiceRegistry {
    readonly billingPlanService: BillingPlanService
    readonly billingEntitlementService: BillingEntitlementService
    constructor(
        private readonly repositories: BillingRepositoryRegistry
    ){
        this.billingPlanService = 
            new BillingPlanService(
                this.repositories.billingPlan
            )
        this.billingEntitlementService =
            new BillingEntitlementService(
                this.repositories.billingEntitlementOveride,
                this.repositories.billingEntitlement
            )
    }
}