import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingSubscriptionKeys } from "./billingSubscriptionStatementKey";

export const BillingSubscriptionStatementDefinition: StatementDefinition[] = [
  { key: billingSubscriptionKeys.upsert, sql: SQL.UPSERT },
  { key: billingSubscriptionKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingSubscriptionKeys.findById, sql: SQL.FINDBYID },
  { key: billingSubscriptionKeys.findCurrentByBusiness, sql: SQL.FINDCURRENTBYBUSINESS },
  { key: billingSubscriptionKeys.findHistoryByBusiness, sql: SQL.FINDHISTORYBYBUSINESS },
  { key: billingSubscriptionKeys.findByBusinessAndStatus, sql: SQL.FINDBYBUSINESSANDSTATUS },
  { key: billingSubscriptionKeys.findByPlanVersion, sql: SQL.FINDBYPLANVERSION },
  { key: billingSubscriptionKeys.findExpiring, sql: SQL.FINDEXPIRING },
  { key: billingSubscriptionKeys.findAll, sql: SQL.FINDALL },
  { key: billingSubscriptionKeys.count, sql: SQL.COUNT_ALL },
];
