
import * as SQL from "./sql";

import type {
  StatementDefinition,
} from "../../../../PreparedStatement/StatementRegistry/statementDefinition";

import {
  billingPlanVersionKeys,
} from "./billingPlanVersionStatementKey";

export const BillingPlanVersionStatementDefinition: StatementDefinition[] = [
  {
    key: billingPlanVersionKeys.insert,
    sql: SQL.BILLING_PLAN_VERSION_INSERT,
  },
  {
    key: billingPlanVersionKeys.markPublished,
    sql: SQL.BILLING_PLAN_VERSION_MARK_PUBLISHED,
  },
  {
    key: billingPlanVersionKeys.findById,
    sql: SQL.BILLING_PLAN_VERSION_FIND_BY_ID,
  },
  {
    key: billingPlanVersionKeys.findByPlanAndVersion,
    sql: SQL.BILLING_PLAN_VERSION_FIND_BY_PLAN_AND_VERSION,
  },
  {
    key: billingPlanVersionKeys.findLatest,
    sql: SQL.BILLING_PLAN_VERSION_FIND_LATEST,
  },
  {
    key: billingPlanVersionKeys.findLatestPublished,
    sql: SQL.BILLING_PLAN_VERSION_FIND_LATEST_PUBLISHED,
  },
  {
    key: billingPlanVersionKeys.findByPlan,
    sql: SQL.BILLING_PLAN_VERSION_FIND_BY_PLAN,
  },
  {
    key: billingPlanVersionKeys.findPublishedByPlan,
    sql: SQL.BILLING_PLAN_VERSION_FIND_PUBLISHED_BY_PLAN,
  },
  {
    key: billingPlanVersionKeys.findAll,
    sql: SQL.BILLING_PLAN_VERSION_FIND_ALL,
  },
  {
    key: billingPlanVersionKeys.countByPlan,
    sql: SQL.BILLING_PLAN_VERSION_COUNT_BY_PLAN,
  },
  {
    key: billingPlanVersionKeys.getAll,
    sql: SQL.BILLING_PLAN_VERSION_GET_ALL,
  },
];
