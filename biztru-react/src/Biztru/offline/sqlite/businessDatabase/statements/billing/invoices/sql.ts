export const UPSERT = `
INSERT INTO billing_invoices (
  id,
  businessId,
  subscriptionId,
  invoiceNumber,
  status,
  currency,
  subtotalMinor,
  taxMinor,
  discountMinor,
  totalMinor,
  amountPaidMinor,
  amountDueMinor,
  periodStart,
  periodEnd,
  issuedAt,
  dueAt,
  paidAt,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  subscriptionId = excluded.subscriptionId,
  invoiceNumber = excluded.invoiceNumber,
  status = excluded.status,
  currency = excluded.currency,
  subtotalMinor = excluded.subtotalMinor,
  taxMinor = excluded.taxMinor,
  discountMinor = excluded.discountMinor,
  totalMinor = excluded.totalMinor,
  amountPaidMinor = excluded.amountPaidMinor,
  amountDueMinor = excluded.amountDueMinor,
  periodStart = excluded.periodStart,
  periodEnd = excluded.periodEnd,
  issuedAt = excluded.issuedAt,
  dueAt = excluded.dueAt,
  paidAt = excluded.paidAt,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_invoices.aggregateVersion
   OR (excluded.aggregateVersion = billing_invoices.aggregateVersion AND excluded.lastEventId IS billing_invoices.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_invoices WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_invoices WHERE id = ? LIMIT 1
`;

export const FINDBYBUSINESS = `
SELECT * FROM billing_invoices WHERE businessId = ? ORDER BY createdAt DESC
`;

export const FINDBYSUBSCRIPTION = `
SELECT * FROM billing_invoices WHERE subscriptionId = ? ORDER BY createdAt DESC
`;

export const FINDBYNUMBER = `
SELECT * FROM billing_invoices WHERE businessId = ? AND invoiceNumber = ? LIMIT 1
`;

export const FINDBYSTATUS = `
SELECT * FROM billing_invoices WHERE businessId = ? AND status = ? ORDER BY createdAt DESC
`;

export const FINDOVERDUE = `
SELECT * FROM billing_invoices WHERE businessId = ? AND status IN ('ISSUED','PARTIALLY_PAID','OVERDUE') AND dueAt IS NOT NULL AND dueAt < ? ORDER BY dueAt ASC
`;

export const FINDALL = `
SELECT * FROM billing_invoices ORDER BY createdAt DESC
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_invoices`;
