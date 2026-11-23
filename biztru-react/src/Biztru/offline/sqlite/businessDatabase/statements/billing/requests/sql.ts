export const UPSERT = `
INSERT INTO billing_subscription_requests (
  id,
  businessId,
  requestedPlanId,
  requestedPlanVersion,
  requestType,
  status,
  requestedBy,
  reviewedBy,
  reviewedAt,
  rejectionReason,
  effectiveAt,
  aggregateVersion,
  lastEventId,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  businessId = excluded.businessId,
  requestedPlanId = excluded.requestedPlanId,
  requestedPlanVersion = excluded.requestedPlanVersion,
  requestType = excluded.requestType,
  status = excluded.status,
  requestedBy = excluded.requestedBy,
  reviewedBy = excluded.reviewedBy,
  reviewedAt = excluded.reviewedAt,
  rejectionReason = excluded.rejectionReason,
  effectiveAt = excluded.effectiveAt,
  aggregateVersion = excluded.aggregateVersion,
  lastEventId = excluded.lastEventId,
  createdAt = excluded.createdAt,
  updatedAt = excluded.updatedAt
WHERE excluded.aggregateVersion > billing_subscription_requests.aggregateVersion
   OR (excluded.aggregateVersion = billing_subscription_requests.aggregateVersion AND excluded.lastEventId IS billing_subscription_requests.lastEventId)
`;

export const DELETE_BY_ID = `DELETE FROM billing_subscription_requests WHERE id = ?`;

export const FINDBYID = `
SELECT * FROM billing_subscription_requests WHERE id = ? LIMIT 1
`;

export const FINDBYBUSINESS = `
SELECT * FROM billing_subscription_requests WHERE businessId = ? ORDER BY createdAt DESC
`;

export const FINDPENDINGBYBUSINESS = `
SELECT * FROM billing_subscription_requests WHERE businessId = ? AND status = 'PENDING' ORDER BY createdAt DESC
`;

export const FINDBYBUSINESSANDSTATUS = `
SELECT * FROM billing_subscription_requests WHERE businessId = ? AND status = ? ORDER BY createdAt DESC
`;

export const FINDBYPLAN = `
SELECT * FROM billing_subscription_requests WHERE requestedPlanId = ? AND requestedPlanVersion = ? ORDER BY createdAt DESC
`;

export const FINDALL = `
SELECT * FROM billing_subscription_requests ORDER BY createdAt DESC
`;

export const COUNT_ALL = `SELECT COUNT(*) AS count FROM billing_subscription_requests`;
