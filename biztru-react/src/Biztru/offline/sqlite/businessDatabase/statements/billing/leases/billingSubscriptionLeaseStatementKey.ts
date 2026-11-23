export const billingSubscriptionLeaseKeys = {
  upsert: "billing_subscription_lease_upsert",
  delete: "billing_subscription_lease_delete",
  count: "billing_subscription_lease_count",
  findById: "billing_subscription_lease_findById",
  findByBusiness: "billing_subscription_lease_findByBusiness",
  findByDevice: "billing_subscription_lease_findByDevice",
  findActiveByBusiness: "billing_subscription_lease_findActiveByBusiness",
  findBySubscription: "billing_subscription_lease_findBySubscription",
  findExpired: "billing_subscription_lease_findExpired",
  findAll: "billing_subscription_lease_findAll",
} as const;
