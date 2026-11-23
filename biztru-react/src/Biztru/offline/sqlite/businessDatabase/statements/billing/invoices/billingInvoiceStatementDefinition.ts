import * as SQL from "./sql";
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import { billingInvoiceKeys } from "./billingInvoiceStatementKey";

export const BillingInvoiceStatementDefinition: StatementDefinition[] = [
  { key: billingInvoiceKeys.upsert, sql: SQL.UPSERT },
  { key: billingInvoiceKeys.delete, sql: SQL.DELETE_BY_ID },
  { key: billingInvoiceKeys.findById, sql: SQL.FINDBYID },
  { key: billingInvoiceKeys.findByBusiness, sql: SQL.FINDBYBUSINESS },
  { key: billingInvoiceKeys.findBySubscription, sql: SQL.FINDBYSUBSCRIPTION },
  { key: billingInvoiceKeys.findByNumber, sql: SQL.FINDBYNUMBER },
  { key: billingInvoiceKeys.findByStatus, sql: SQL.FINDBYSTATUS },
  { key: billingInvoiceKeys.findOverdue, sql: SQL.FINDOVERDUE },
  { key: billingInvoiceKeys.findAll, sql: SQL.FINDALL },
  { key: billingInvoiceKeys.count, sql: SQL.COUNT_ALL },
];
