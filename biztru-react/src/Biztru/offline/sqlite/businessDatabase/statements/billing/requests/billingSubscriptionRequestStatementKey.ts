export const billingSubscriptionRequestKeys = {
  upsert: "billing_subscription_request_upsert",
  delete: "billing_subscription_request_delete",
  count: "billing_subscription_request_count",
  findById: "billing_subscription_request_findById",
  findByBusiness: "billing_subscription_request_findByBusiness",
  findPendingByBusiness: "billing_subscription_request_findPendingByBusiness",
  findByBusinessAndStatus: "billing_subscription_request_findByBusinessAndStatus",
  findByPlan: "billing_subscription_request_findByPlan",
  findAll: "billing_subscription_request_findAll",
} as const;
