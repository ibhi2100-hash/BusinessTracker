import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingSubscriptionLeaseKeys } from "./billingSubscriptionLeaseStatementKey";

export const BillingSubscriptionLeaseStatementDefinition: StatementDefinition[] = [
  { key: billingSubscriptionLeaseKeys.upsert, sql: SQL.UPSERT },
  { key: billingSubscriptionLeaseKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingSubscriptionLeaseKeys.findById, sql: SQL.FINDBYID },
  { key: billingSubscriptionLeaseKeys.findByBusiness, sql: SQL.FINDBYBUSINESS },
  { key: billingSubscriptionLeaseKeys.findByDevice, sql: SQL.FINDBYDEVICE },
  { key: billingSubscriptionLeaseKeys.findActiveByBusiness, sql: SQL.FINDACTIVEBYBUSINESS },
  { key: billingSubscriptionLeaseKeys.findBySubscription, sql: SQL.FINDBYSUBSCRIPTION },
  { key: billingSubscriptionLeaseKeys.findExpired, sql: SQL.FINDEXPIRED },
  { key: billingSubscriptionLeaseKeys.findAll, sql: SQL.FINDALL },
  { key: billingSubscriptionLeaseKeys.count, sql: SQL.COUNT_ALL },
];
