export const billingSubscriptionKeys = {
  upsert: "billing_subscription_upsert",
  delete: "billing_subscription_delete",
  count: "billing_subscription_count",
  findById: "billing_subscription_findById",
  findCurrentByBusiness: "billing_subscription_findCurrentByBusiness",
  findHistoryByBusiness: "billing_subscription_findHistoryByBusiness",
  findByBusinessAndStatus: "billing_subscription_findByBusinessAndStatus",
  findByPlanVersion: "billing_subscription_findByPlanVersion",
  findExpiring: "billing_subscription_findExpiring",
  findAll: "billing_subscription_findAll",
} as const;
