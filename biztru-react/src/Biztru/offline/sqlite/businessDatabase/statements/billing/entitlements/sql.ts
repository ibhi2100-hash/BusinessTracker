export const UPSERT = `
INSERT INTO billing_entitlements (
  id,
  businessId,
  subscriptionId,
  entitlementKey,
  valueJson,
  source,
  status,
  validFrom,
  validUntil,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  subscriptionId = excluded.subscriptionId,
  entitlementKey = excluded.entitlementKey,
  valueJson = excluded.valueJson,
  source = excluded.source,
  status = excluded.status,
  validFrom = excluded.validFrom,
  validUntil = excluded.validUntil,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_entitlements.aggregateVersion
   OR (excluded.aggregateVersion = billing_entitlements.aggregateVersion AND excluded.lastEventId IS billing_entitlements.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_entitlements WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_entitlements WHERE id = ? LIMIT 1
`;

export const FINDBYBUSINESSANDKEY = `
SELECT * FROM billing_entitlements WHERE businessId = ? AND entitlementKey = ? LIMIT 1
`;

export const FINDBYBUSINESS = `
SELECT * FROM billing_entitlements WHERE businessId = ? ORDER BY entitlementKey ASC
`;

export const FINDACTIVEBYBUSINESS = `
SELECT * FROM billing_entitlements WHERE businessId = ? AND status = 'ACTIVE' AND (validFrom IS NULL OR validFrom <= ?) AND (validUntil IS NULL OR validUntil > ?) ORDER BY entitlementKey ASC
`;

export const FINDBYSUBSCRIPTION = `
SELECT * FROM billing_entitlements WHERE subscriptionId = ? ORDER BY entitlementKey ASC
`;

export const FINDALL = `
SELECT * FROM billing_entitlements ORDER BY businessId, entitlementKey
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_entitlements`;
