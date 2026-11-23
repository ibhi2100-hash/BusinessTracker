
/**
 * Plan versions are immutable.
 *
 * INSERT OR IGNORE makes synchronization idempotent:
 * an existing version's commercial terms are never overwritten.
 */
export const BILLING_PLAN_VERSION_INSERT = `
INSERT OR IGNORE INTO billing_plan_versions (
  id,
  planId,
  planVersion,
  priceMinor,
  currency,
  billingCycle,
  intervalCount,
  trialDays,
  maxStaff,
  maxBranch,
  maxProduct,
  featuresJson,
  publishedAt,
  createdAt
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
`;

/**
 * Publication is the only mutable field in the local
 * immutable-version projection.
 *
 * Once publishedAt has been populated, do not replace it.
 */
export const BILLING_PLAN_VERSION_MARK_PUBLISHED = `
UPDATE billing_plan_versions
SET publishedAt = COALESCE(publishedAt, ?)
WHERE planId = ?
  AND planVersion = ?
`;

export const BILLING_PLAN_VERSION_FIND_BY_ID = `
SELECT *
FROM billing_plan_versions
WHERE id = ?
LIMIT 1
`;

export const BILLING_PLAN_VERSION_FIND_BY_PLAN_AND_VERSION = `
SELECT *
FROM billing_plan_versions
WHERE planId = ?
  AND planVersion = ?
LIMIT 1
`;

export const BILLING_PLAN_VERSION_FIND_LATEST = `
SELECT *
FROM billing_plan_versions
WHERE planId = ?
ORDER BY planVersion DESC
LIMIT 1
`;

export const BILLING_PLAN_VERSION_FIND_LATEST_PUBLISHED = `
SELECT *
FROM billing_plan_versions
WHERE planId = ?
  AND publishedAt IS NOT NULL
ORDER BY planVersion DESC
LIMIT 1
`;

export const BILLING_PLAN_VERSION_FIND_BY_PLAN = `
SELECT *
FROM billing_plan_versions
WHERE planId = ?
ORDER BY planVersion DESC
`;

export const BILLING_PLAN_VERSION_FIND_PUBLISHED_BY_PLAN = `
SELECT *
FROM billing_plan_versions
WHERE planId = ?
  AND publishedAt IS NOT NULL
ORDER BY planVersion DESC
`;

export const BILLING_PLAN_VERSION_FIND_ALL = `
SELECT *
FROM billing_plan_versions
ORDER BY planId ASC, planVersion DESC
`;

export const BILLING_PLAN_VERSION_COUNT_BY_PLAN = `
SELECT COUNT(*) AS count
FROM billing_plan_versions
WHERE planId = ?
`;

export const BILLING_PLAN_VERSION_GET_ALL = `
SELECT *
FROM billing_plan_versions
`;
