export const UPSERT = `
INSERT INTO billing_subscription_leases (
  id,
  businessId,
  subscriptionId,
  branchId,
  deviceId,
  issuedAt,
  expiresAt,
  gracePeriodEnd,
  status,
  entitlementSnapshotJson,
  signedToken,
  revokedAt,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  subscriptionId = excluded.subscriptionId,
  branchId = excluded.branchId,
  deviceId = excluded.deviceId,
  issuedAt = excluded.issuedAt,
  expiresAt = excluded.expiresAt,
  gracePeriodEnd = excluded.gracePeriodEnd,
  status = excluded.status,
  entitlementSnapshotJson = excluded.entitlementSnapshotJson,
  signedToken = excluded.signedToken,
  revokedAt = excluded.revokedAt,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_subscription_leases.aggregateVersion
   OR (excluded.aggregateVersion = billing_subscription_leases.aggregateVersion AND excluded.lastEventId IS billing_subscription_leases.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_subscription_leases WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_subscription_leases WHERE id = ? LIMIT 1
`;

export const FINDBYBUSINESS = `
SELECT * FROM billing_subscription_leases WHERE businessId = ? ORDER BY issuedAt DESC
`;

export const FINDBYDEVICE = `
SELECT * FROM billing_subscription_leases WHERE businessId = ? AND branchId IS ? AND deviceId = ? ORDER BY issuedAt DESC LIMIT 1
`;

export const FINDACTIVEBYBUSINESS = `
SELECT * FROM billing_subscription_leases WHERE businessId = ? AND status = 'ACTIVE' AND expiresAt > ? ORDER BY issuedAt DESC
`;

export const FINDBYSUBSCRIPTION = `
SELECT * FROM billing_subscription_leases WHERE subscriptionId = ? ORDER BY issuedAt DESC
`;

export const FINDEXPIRED = `
SELECT * FROM billing_subscription_leases WHERE status = 'ACTIVE' AND expiresAt <= ? ORDER BY expiresAt ASC
`;

export const FINDALL = `
SELECT * FROM billing_subscription_leases ORDER BY issuedAt DESC
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_subscription_leases`;
