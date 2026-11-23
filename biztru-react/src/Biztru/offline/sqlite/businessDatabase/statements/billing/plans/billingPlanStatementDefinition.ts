
import * as SQL from "./sql";

import type {
  StatementDefinition,
} from "../../../../PreparedStatement/StatementRegistry/statementDefinition";

import {
  billingPlanKeys,
} from "./billingPlanStatementKey";

export const BillingPlanStatementDefinition: StatementDefinition[] = [
  {
    key: billingPlanKeys.upsert,
    sql: SQL.BILLING_PLAN_UPSERT,
  },
  {
    key: billingPlanKeys.findById,
    sql: SQL.BILLING_PLAN_FIND_BY_ID,
  },
  {
    key: billingPlanKeys.findByCode,
    sql: SQL.BILLING_PLAN_FIND_BY_CODE,
  },
  {
    key: billingPlanKeys.update,
    sql: SQL.BILLING_PLAN_UPDATE,
  },
  {
    key: billingPlanKeys.delete,
    sql: SQL.BILLING_PLAN_DELETE,
  },
  {
    key: billingPlanKeys.findAll,
    sql: SQL.BILLING_PLAN_FIND_ALL,
  },
  {
    key: billingPlanKeys.list,
    sql: SQL.BILLING_PLAN_LIST,
  },
  {
    key: billingPlanKeys.count,
    sql: SQL.BILLING_PLAN_COUNT,
  },
  {
    key: billingPlanKeys.findPublished,
    sql: SQL.BILLING_PLAN_FIND_PUBLISHED,
  },
  {
    key: billingPlanKeys.getAll,
    sql: SQL.BILLING_PLAN_GET_ALL,
  },
];
