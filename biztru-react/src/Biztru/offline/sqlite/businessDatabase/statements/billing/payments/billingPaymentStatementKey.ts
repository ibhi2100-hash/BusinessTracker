export const billingPaymentKeys = {
  upsert: "billing_payment_upsert",
  delete: "billing_payment_delete",
  count: "billing_payment_count",
  findById: "billing_payment_findById",
  findByBusiness: "billing_payment_findByBusiness",
  findByInvoice: "billing_payment_findByInvoice",
  findBySubscription: "billing_payment_findBySubscription",
  findByProviderReference: "billing_payment_findByProviderReference",
  findByStatus: "billing_payment_findByStatus",
  findAll: "billing_payment_findAll",
} as const;
