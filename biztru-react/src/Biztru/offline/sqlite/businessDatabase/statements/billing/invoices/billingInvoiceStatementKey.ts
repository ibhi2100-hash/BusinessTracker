export const billingInvoiceKeys = {
  upsert: "billing_invoice_upsert",
  delete: "billing_invoice_delete",
  count: "billing_invoice_count",
  findById: "billing_invoice_findById",
  findByBusiness: "billing_invoice_findByBusiness",
  findBySubscription: "billing_invoice_findBySubscription",
  findByNumber: "billing_invoice_findByNumber",
  findByStatus: "billing_invoice_findByStatus",
  findOverdue: "billing_invoice_findOverdue",
  findAll: "billing_invoice_findAll",
} as const;
