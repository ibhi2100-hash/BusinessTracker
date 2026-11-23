export const UPSERT = `
INSERT INTO billing_entitlement_overrides (
  id,
  businessId,
  subscriptionId,
  entitlementKey,
  valueJson,
  status,
  reason,
  startsAt,
  expiresAt,
  createdBy,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  subscriptionId = excluded.subscriptionId,
  entitlementKey = excluded.entitlementKey,
  valueJson = excluded.valueJson,
  status = excluded.status,
  reason = excluded.reason,
  startsAt = excluded.startsAt,
  expiresAt = excluded.expiresAt,
  createdBy = excluded.createdBy,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_entitlement_overrides.aggregateVersion
   OR (excluded.aggregateVersion = billing_entitlement_overrides.aggregateVersion AND excluded.lastEventId IS billing_entitlement_overrides.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_entitlement_overrides WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_entitlement_overrides WHERE id = ? LIMIT 1
`;

export const FINDBYBUSINESS = `
SELECT * FROM billing_entitlement_overrides WHERE businessId = ? ORDER BY createdAt DESC
`;

export const FINDBYBUSINESSANDKEY = `
SELECT * FROM billing_entitlement_overrides WHERE businessId = ? AND entitlementKey = ? ORDER BY createdAt DESC
`;

export const FINDACTIVEBYBUSINESS = `
SELECT * FROM billing_entitlement_overrides WHERE businessId = ? AND status = 'ACTIVE' AND (startsAt IS NULL OR startsAt <= ?) AND (expiresAt IS NULL OR expiresAt > ?) ORDER BY entitlementKey ASC
`;

export const FINDBYSUBSCRIPTION = `
SELECT * FROM billing_entitlement_overrides WHERE subscriptionId = ? ORDER BY createdAt DESC
`;

export const FINDALL = `
SELECT * FROM billing_entitlement_overrides ORDER BY createdAt DESC
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_entitlement_overrides`;
