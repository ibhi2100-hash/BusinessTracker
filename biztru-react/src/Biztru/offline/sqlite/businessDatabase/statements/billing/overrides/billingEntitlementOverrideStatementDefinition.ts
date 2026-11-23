import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingEntitlementOverrideKeys } from "./billingEntitlementOverrideStatementKey";

export const BillingEntitlementOverrideStatementDefinition: StatementDefinition[] = [
  { key: billingEntitlementOverrideKeys.upsert, sql: SQL.UPSERT },
  { key: billingEntitlementOverrideKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingEntitlementOverrideKeys.findById, sql: SQL.FINDBYID },
  { key: billingEntitlementOverrideKeys.findByBusiness, sql: SQL.FINDBYBUSINESS },
  { key: billingEntitlementOverrideKeys.findByBusinessAndKey, sql: SQL.FINDBYBUSINESSANDKEY },
  { key: billingEntitlementOverrideKeys.findActiveByBusiness, sql: SQL.FINDACTIVEBYBUSINESS },
  { key: billingEntitlementOverrideKeys.findBySubscription, sql: SQL.FINDBYSUBSCRIPTION },
  { key: billingEntitlementOverrideKeys.findAll, sql: SQL.FINDALL },
  { key: billingEntitlementOverrideKeys.count, sql: SQL.COUNT_ALL },
];
