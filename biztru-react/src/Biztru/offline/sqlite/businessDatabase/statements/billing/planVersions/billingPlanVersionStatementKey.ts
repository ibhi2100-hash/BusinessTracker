
export const billingPlanVersionKeys = {
  insert: "billing_plan_version_insert",
  markPublished: "billing_plan_version_mark_published",
  findById: "billing_plan_version_find_by_id",
  findByPlanAndVersion: "billing_plan_version_find_by_plan_and_version",
  findLatest: "billing_plan_version_find_latest",
  findLatestPublished: "billing_plan_version_find_latest_published",
  findByPlan: "billing_plan_version_find_by_plan",
  findPublishedByPlan: "billing_plan_version_find_published_by_plan",
  findAll: "billing_plan_version_find_all",
  countByPlan: "billing_plan_version_count_by_plan",
  getAll: "billing_plan_version_get_all",
} as const;
