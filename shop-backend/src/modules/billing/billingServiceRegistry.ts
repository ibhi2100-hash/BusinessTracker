import { BillingRepositoryRegistry } from "./billingRepositoryRegistry.js";
import { BillingEntitlementService } from "./service/billing-entitlement.service.js";
import { BillingPlanService } from "./service/billing-plan.service.js";
import { BillingSubscriptionService } from "./service/billing-subscription.service.js";

export class BillingServiceRegistry {
    readonly billingPlanService: BillingPlanService
    readonly billingEntitlementService: BillingEntitlementService;
    readonly billingSubscriptionService: BillingSubscriptionService;
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
            );

        this.billingSubscriptionService = 
            new BillingSubscriptionService(
                this.repositories.billingSubscription,
                this.repositories.billingEntitlement
            )
    }
}