import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingPaymentKeys } from "./billingPaymentStatementKey";

export const BillingPaymentStatementDefinition: StatementDefinition[] = [
  { key: billingPaymentKeys.upsert, sql: SQL.UPSERT },
  { key: billingPaymentKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingPaymentKeys.findById, sql: SQL.FINDBYID },
  { key: billingPaymentKeys.findByBusiness, sql: SQL.FINDBYBUSINESS },
  { key: billingPaymentKeys.findByInvoice, sql: SQL.FINDBYINVOICE },
  { key: billingPaymentKeys.findBySubscription, sql: SQL.FINDBYSUBSCRIPTION },
  { key: billingPaymentKeys.findByProviderReference, sql: SQL.FINDBYPROVIDERREFERENCE },
  { key: billingPaymentKeys.findByStatus, sql: SQL.FINDBYSTATUS },
  { key: billingPaymentKeys.findAll, sql: SQL.FINDALL },
  { key: billingPaymentKeys.count, sql: SQL.COUNT_ALL },
];
