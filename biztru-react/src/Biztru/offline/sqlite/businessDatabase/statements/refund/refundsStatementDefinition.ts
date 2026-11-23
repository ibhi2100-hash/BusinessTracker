import type { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import * as SQL from "./sql";
import { refundsKeys } from "./refundsStatementKeys";

export const RefundStatementDefinition: StatementDefinition[] = [
  { key: refundsKeys.refundUpsert, sql: SQL.REFUND_UPSERT },
  { key: refundsKeys.refundItemUpsert, sql: SQL.REFUND_ITEM_UPSERT },
  { key: refundsKeys.refundPaymentUpsert, sql: SQL.REFUND_PAYMENT_UPSERT },
  { key: refundsKeys.findRefundById, sql: SQL.FIND_REFUND_BY_ID },
  { key: refundsKeys.findRefundItems, sql: SQL.FIND_REFUND_ITEMS },
  { key: refundsKeys.findRefundPayments, sql: SQL.FIND_REFUND_PAYMENTS },
  { key: refundsKeys.listRefunds, sql: SQL.LIST_REFUNDS },
  { key: refundsKeys.countRefunds, sql: SQL.COUNT_REFUNDS },
  { key: refundsKeys.summaryByDateRange, sql: SQL.REFUND_SUMMARY_BY_DATE_RANGE },
  { key: refundsKeys.findRefundsBySale, sql: SQL.FIND_REFUNDS_BY_SALE },
];
