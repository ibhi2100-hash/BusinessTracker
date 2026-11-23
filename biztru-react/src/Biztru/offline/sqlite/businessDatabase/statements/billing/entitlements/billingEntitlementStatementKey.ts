export const billingEntitlementKeys = {
  upsert: "billing_entitlement_upsert",
  delete: "billing_entitlement_delete",
  count: "billing_entitlement_count",
  findById: "billing_entitlement_findById",
  findByBusinessAndKey: "billing_entitlement_findByBusinessAndKey",
  findByBusiness: "billing_entitlement_findByBusiness",
  findActiveByBusiness: "billing_entitlement_findActiveByBusiness",
  findBySubscription: "billing_entitlement_findBySubscription",
  findAll: "billing_entitlement_findAll",
} as const;
