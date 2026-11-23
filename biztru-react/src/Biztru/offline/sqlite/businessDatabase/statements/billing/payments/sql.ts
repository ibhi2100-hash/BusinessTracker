export const UPSERT = `
INSERT INTO billing_payments (
  id,
  businessId,
  subscriptionId,
  invoiceId,
  provider,
  providerReference,
  method,
  status,
  currency,
  amountMinor,
  refundedMinor,
  initiatedAt,
  confirmedAt,
  failedAt,
  reversedAt,
  refundedAt,
  failureReason,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  subscriptionId = excluded.subscriptionId,
  invoiceId = excluded.invoiceId,
  provider = excluded.provider,
  providerReference = excluded.providerReference,
  method = excluded.method,
  status = excluded.status,
  currency = excluded.currency,
  amountMinor = excluded.amountMinor,
  refundedMinor = excluded.refundedMinor,
  initiatedAt = excluded.initiatedAt,
  confirmedAt = excluded.confirmedAt,
  failedAt = excluded.failedAt,
  reversedAt = excluded.reversedAt,
  refundedAt = excluded.refundedAt,
  failureReason = excluded.failureReason,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_payments.aggregateVersion
   OR (excluded.aggregateVersion = billing_payments.aggregateVersion AND excluded.lastEventId IS billing_payments.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_payments WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_payments WHERE id = ? LIMIT 1
`;

export const FINDBYBUSINESS = `
SELECT * FROM billing_payments WHERE businessId = ? ORDER BY createdAt DESC
`;

export const FINDBYINVOICE = `
SELECT * FROM billing_payments WHERE invoiceId = ? ORDER BY createdAt DESC
`;

export const FINDBYSUBSCRIPTION = `
SELECT * FROM billing_payments WHERE subscriptionId = ? ORDER BY createdAt DESC
`;

export const FINDBYPROVIDERREFERENCE = `
SELECT * FROM billing_payments WHERE provider = ? AND providerReference = ? LIMIT 1
`;

export const FINDBYSTATUS = `
SELECT * FROM billing_payments WHERE businessId = ? AND status = ? ORDER BY createdAt DESC
`;

export const FINDALL = `
SELECT * FROM billing_payments ORDER BY createdAt DESC
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_payments`;
