import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingSubscriptionRequestKeys } from "./billingSubscriptionRequestStatementKey";

export const BillingSubscriptionRequestStatementDefinition: StatementDefinition[] = [
  { key: billingSubscriptionRequestKeys.upsert, sql: SQL.UPSERT },
  { key: billingSubscriptionRequestKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingSubscriptionRequestKeys.findById, sql: SQL.FINDBYID },
  { key: billingSubscriptionRequestKeys.findByBusiness, sql: SQL.FINDBYBUSINESS },
  { key: billingSubscriptionRequestKeys.findPendingByBusiness, sql: SQL.FINDPENDINGBYBUSINESS },
  { key: billingSubscriptionRequestKeys.findByBusinessAndStatus, sql: SQL.FINDBYBUSINESSANDSTATUS },
  { key: billingSubscriptionRequestKeys.findByPlan, sql: SQL.FINDBYPLAN },
  { key: billingSubscriptionRequestKeys.findAll, sql: SQL.FINDALL },
  { key: billingSubscriptionRequestKeys.count, sql: SQL.COUNT_ALL },
];
