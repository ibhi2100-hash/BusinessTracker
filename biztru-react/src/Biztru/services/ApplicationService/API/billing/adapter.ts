const operations = [
  ...planRecords.map(plan => plans.upsertOperation(plan)),
  ...planVersionRecords.map(version =>
    planVersions.upsertOperation(version)
  ),
  ...subscriptionRecords.map(subscription =>
    subscriptions.upsertOperation(subscription)
  ),
  ...entitlementRecords.map(entitlement =>
    entitlements.upsertOperation(entitlement)
  ),
  ...overrideRecords.map(override =>
    overrides.upsertOperation(override)
  ),
  ...invoiceRecords.map(invoice =>
    invoices.upsertOperation(invoice)
  ),
  ...paymentRecords.map(payment =>
    payments.upsertOperation(payment)
  ),
  ...requestRecords.map(request =>
    requests.upsertOperation(request)
  ),
  ...leaseRecords.map(lease =>
    leases.upsertOperation(lease)
  ),
];

// Pass the complete operations array to your existing
// SQLite worker transaction coordinator.
// Do not execute these as separate commits.