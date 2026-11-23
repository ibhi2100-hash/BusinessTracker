import { BillingAuditRepository } from "./repositories/billing-audit.repository.js";
import { BillingEntitlementOverrideRepository } from "./repositories/billing-entitlement-override.repository.js";
import { BillingEntitlementRepository } from "./repositories/billing-entitlement.repository.js";
import { BillingEventRepository } from "./repositories/billing-event.repository.js";
import { BillingIdempotencyRepository } from "./repositories/billing-idempotency.repository.js";
import { BillingInvoiceItemRepository } from "./repositories/billing-invoice-item.repository.js";
import { BillingInvoiceRepository } from "./repositories/billing-invoice.repository.js";
import { BillingLeaseRepository } from "./repositories/billing-lease.repository.js";
import { BillingOutboxRepository } from "./repositories/billing-outbox.repository.js";
import { BillingPaymentAllocationRepository } from "./repositories/billing-payment-allocation.repository.js";
import { BillingPaymentAttemptRepository } from "./repositories/billing-payment-attempt.repository.js";
import { BillingPaymentRepository } from "./repositories/billing-payment.repository.js";
import { BillingPlanRepository } from "./repositories/billing-plan.repository.js";
import { BillingProviderAccountRepository } from "./repositories/billing-provider-account.repository.js";
import { BillingProviderCustomerRepository } from "./repositories/billing-provider-customer.repository.js";
import { BillingProviderOperationRepository } from "./repositories/billing-provider-operation.repository.js";
import { BillingProviderSubscriptionRepository } from "./repositories/billing-provider-subscription.repository.js";
import { BillingRefundRepository } from "./repositories/billing-refund.repository.js";
import { BillingSubscriptionRequestRepository } from "./repositories/billing-subscription-request.repository.js";
import { BillingSubscriptionRepository } from "./repositories/billing-subscription.repository.js";
import { BillingWebhookRepository } from "./repositories/billing-webhook.repository.js";

export class BillingRepositoryRegistry {
    readonly billingAudit: BillingAuditRepository;
    readonly billingEntitlementOveride: BillingEntitlementOverrideRepository;
    readonly billingEntitlement: BillingEntitlementRepository;
    readonly billingEvent: BillingEventRepository;
    readonly billingIdempotency: BillingIdempotencyRepository;
    readonly billingInvoiceItem: BillingInvoiceItemRepository;
    readonly billingInvoice: BillingInvoiceRepository;
    readonly billingLease: BillingLeaseRepository;
    readonly billingOutbox: BillingOutboxRepository;
    readonly billingPaymentAllocation: BillingPaymentAllocationRepository;
    readonly billingPaymentAttempt: BillingPaymentAttemptRepository;
    readonly billingPayment: BillingPaymentRepository;
    readonly billingPlan: BillingPlanRepository;
    readonly billingProviderAccount: BillingProviderAccountRepository;
    readonly billingProviderCustomer: BillingProviderCustomerRepository;
    readonly billingProviderOperation: BillingProviderOperationRepository;
    readonly billingProviderSubscription: BillingProviderSubscriptionRepository;
    readonly billingRefund: BillingRefundRepository;
    readonly billingSubscriptionRequest: BillingSubscriptionRequestRepository;
    readonly billingSubscription: BillingSubscriptionRepository;
    readonly billingWebhook: BillingWebhookRepository;
    constructor(){
        this.billingAudit = new BillingAuditRepository();
        this.billingEntitlementOveride = new BillingEntitlementOverrideRepository();
        this.billingEntitlement = new BillingEntitlementRepository();
        this.billingEvent = new BillingEventRepository();
        this.billingIdempotency = new BillingIdempotencyRepository();
        this.billingInvoiceItem = new BillingInvoiceItemRepository();
        this.billingInvoice = new BillingInvoiceRepository();
        this.billingLease = new BillingLeaseRepository();
        this.billingOutbox = new BillingOutboxRepository();
        this.billingPaymentAllocation = new BillingPaymentAllocationRepository();
        this.billingPaymentAttempt = new  BillingPaymentAttemptRepository();
        this.billingPayment = new BillingPaymentRepository();
        this.billingPlan = new BillingPlanRepository();
        this.billingProviderAccount = new BillingProviderAccountRepository();
        this.billingProviderCustomer = new BillingProviderCustomerRepository();
        this.billingProviderOperation = new BillingProviderOperationRepository();
        this.billingProviderSubscription = new BillingProviderSubscriptionRepository();
        this.billingRefund = new BillingRefundRepository();
        this.billingSubscriptionRequest = new BillingSubscriptionRequestRepository();
        this.billingSubscription = new BillingSubscriptionRepository();
        this.billingWebhook = new BillingWebhookRepository()
    }
}