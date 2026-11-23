export const UPSERT = `
INSERT INTO billing_subscriptions (
  id,
  businessId,
  planId,
  planVersion,
  status,
  billingCycle,
  currency,
  priceMinor,
  trialStart,
  trialEnd,
  currentPeriodStart,
  currentPeriodEnd,
  gracePeriodEnd,
  cancelAtPeriodEnd,
  activatedAt,
  cancelledAt,
  expiredAt,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  planId = excluded.planId,
  planVersion = excluded.planVersion,
  status = excluded.status,
  billingCycle = excluded.billingCycle,
  currency = excluded.currency,
  priceMinor = excluded.priceMinor,
  trialStart = excluded.trialStart,
  trialEnd = excluded.trialEnd,
  currentPeriodStart = excluded.currentPeriodStart,
  currentPeriodEnd = excluded.currentPeriodEnd,
  gracePeriodEnd = excluded.gracePeriodEnd,
  cancelAtPeriodEnd = excluded.cancelAtPeriodEnd,
  activatedAt = excluded.activatedAt,
  cancelledAt = excluded.cancelledAt,
  expiredAt = excluded.expiredAt,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_subscriptions.aggregateVersion
   OR (excluded.aggregateVersion = billing_subscriptions.aggregateVersion AND excluded.lastEventId IS billing_subscriptions.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_subscriptions WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_subscriptions WHERE id = ? LIMIT 1
`;

export const FINDCURRENTBYBUSINESS = `
SELECT * FROM billing_subscriptions WHERE businessId = ? AND status IN ('PENDING','TRIALING','ACTIVE','PAST_DUE','GRACE_PERIOD','SUSPENDED') ORDER BY updatedAt DESC LIMIT 1
`;

export const FINDHISTORYBYBUSINESS = `
SELECT * FROM billing_subscriptions WHERE businessId = ? ORDER BY createdAt DESC
`;

export const FINDBYBUSINESSANDSTATUS = `
SELECT * FROM billing_subscriptions WHERE businessId = ? AND status = ? ORDER BY updatedAt DESC
`;

export const FINDBYPLANVERSION = `
SELECT * FROM billing_subscriptions WHERE planId = ? AND planVersion = ? ORDER BY createdAt DESC
`;

export const FINDEXPIRING = `
SELECT * FROM billing_subscriptions WHERE currentPeriodEnd IS NOT NULL AND currentPeriodEnd >= ? AND currentPeriodEnd <= ? AND status IN ('ACTIVE','TRIALING','GRACE_PERIOD') ORDER BY currentPeriodEnd ASC
`;

export const FINDALL = `
SELECT * FROM billing_subscriptions ORDER BY updatedAt DESC
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_subscriptions`;
