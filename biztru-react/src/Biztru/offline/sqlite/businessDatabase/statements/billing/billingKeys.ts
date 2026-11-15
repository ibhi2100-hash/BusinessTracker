
export const billingKeys = {

    /* Plans */
    planUpsert: "billing_plan_upsert",
    planFindById: "billing_plan_find_by_id",
    planFindByCode: "billing_plan_find_by_code",
    planList: "billing_plan_list",

    /* Plan versions */
    planVersionUpsert: "billing_plan_version_upsert",
    planVersionFindById: "billing_plan_version_find_by_id",
    planVersionFindByNumber: "billing_plan_version_find_by_number",
    planVersionList: "billing_plan_version_list",

    /* Subscriptions */
    subscriptionUpsert: "billing_subscription_upsert",
    subscriptionFindById: "billing_subscription_find_by_id",
    subscriptionFindByBusiness: "billing_subscription_find_by_business",
    subscriptionList: "billing_subscription_list",

    /* Entitlements */
    entitlementUpsert: "billing_entitlement_upsert",
    entitlementFindById: "billing_entitlement_find_by_id",
    entitlementFindByKey: "billing_entitlement_find_by_key",
    entitlementList: "billing_entitlement_list",

    /* Entitlement overrides */
    entitlementOverrideUpsert: "billing_entitlement_override_upsert",
    entitlementOverrideFindById: "billing_entitlement_override_find_by_id",
    entitlementOverrideList: "billing_entitlement_override_list",

    /* Invoices */
    invoiceUpsert: "billing_invoice_upsert",
    invoiceFindById: "billing_invoice_find_by_id",
    invoiceFindByNumber: "billing_invoice_find_by_number",
    invoiceList: "billing_invoice_list",
    invoiceListBySubscription: "billing_invoice_list_by_subscription",

    /* Payments */
    paymentUpsert: "billing_payment_upsert",
    paymentFindById: "billing_payment_find_by_id",
    paymentFindByProviderReference: "billing_payment_find_by_provider_reference",
    paymentList: "billing_payment_list",
    paymentListByInvoice: "billing_payment_list_by_invoice",

    /* Subscription requests */
    subscriptionRequestUpsert: "billing_subscription_request_upsert",
    subscriptionRequestFindById: "billing_subscription_request_find_by_id",
    subscriptionRequestList: "billing_subscription_request_list",

    /* Subscription leases */
    subscriptionLeaseUpsert: "billing_subscription_lease_upsert",
    subscriptionLeaseFindById: "billing_subscription_lease_find_by_id",
    subscriptionLeaseFindByDevice: "billing_subscription_lease_find_by_device",
    subscriptionLeaseList: "billing_subscription_lease_list",

} as const;

export type BillingStatementKey =
    typeof billingKeys[keyof typeof billingKeys];
