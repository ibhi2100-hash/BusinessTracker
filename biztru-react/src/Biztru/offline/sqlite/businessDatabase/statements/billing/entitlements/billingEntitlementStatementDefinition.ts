import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingEntitlementKeys } from "./billingEntitlementStatementKey";

export const BillingEntitlementStatementDefinition: StatementDefinition[] = [
  { key: billingEntitlementKeys.upsert, sql: SQL.UPSERT },
  { key: billingEntitlementKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingEntitlementKeys.findById, sql: SQL.FINDBYID },
  { key: billingEntitlementKeys.findByBusinessAndKey, sql: SQL.FINDBYBUSINESSANDKEY },
  { key: billingEntitlementKeys.findByBusiness, sql: SQL.FINDBYBUSINESS },
  { key: billingEntitlementKeys.findActiveByBusiness, sql: SQL.FINDACTIVEBYBUSINESS },
  { key: billingEntitlementKeys.findBySubscription, sql: SQL.FINDBYSUBSCRIPTION },
  { key: billingEntitlementKeys.findAll, sql: SQL.FINDALL },
  { key: billingEntitlementKeys.count, sql: SQL.COUNT_ALL },
];
