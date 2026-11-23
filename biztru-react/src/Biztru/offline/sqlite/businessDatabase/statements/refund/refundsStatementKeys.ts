export const refundsKeys = {
  refundUpsert: "refund_upsert",
  refundItemUpsert: "refund_item_upsert",
  refundPaymentUpsert: "refund_payment_upsert",
  findRefundById: "refund_find_by_id",
  findRefundItems: "refund_find_items",
  findRefundPayments: "refund_find_payments",
  listRefunds: "refund_list",
  countRefunds: "refund_count",
  summaryByDateRange: "refund_summary_by_date_range",
  findRefundsBySale: "refund_find_by_sale",
} as const;
