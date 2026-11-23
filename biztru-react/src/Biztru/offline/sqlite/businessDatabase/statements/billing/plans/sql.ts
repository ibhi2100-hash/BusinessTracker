
export const BILLING_PLAN_UPSERT = `
INSERT INTO billing_plans (
  id,
  code,
  name,
  description,
  status,
  displayOrder,
  isFeatured,
  createdAt,
  updatedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id)
DO UPDATE SET
  code         = excluded.code,
  name         = excluded.name,
  description  = excluded.description,
  status       = excluded.status,
  displayOrder = excluded.displayOrder,
  isFeatured   = excluded.isFeatured,
  updatedAt    = excluded.updatedAt
`;

export const BILLING_PLAN_FIND_BY_ID = `
SELECT *
FROM billing_plans
WHERE id = ?
LIMIT 1
`;

export const BILLING_PLAN_FIND_BY_CODE = `
SELECT *
FROM billing_plans
WHERE code = ?
LIMIT 1
`;

export const BILLING_PLAN_UPDATE = `
UPDATE billing_plans
SET
  code         = ?,
  name         = ?,
  description  = ?,
  status       = ?,
  displayOrder = ?,
  isFeatured   = ?,
  updatedAt    = ?
WHERE id = ?
`;

export const BILLING_PLAN_DELETE = `
DELETE FROM billing_plans
WHERE id = ?
`;

export const BILLING_PLAN_FIND_ALL = `
SELECT *
FROM billing_plans
ORDER BY displayOrder ASC, createdAt DESC
`;

export const BILLING_PLAN_LIST = `
SELECT *
FROM billing_plans
WHERE
  (? = 'all' OR status = ?)
  AND (
    ? IS NULL
    OR name LIKE '%' || ? || '%'
    OR code LIKE '%' || ? || '%'
  )
ORDER BY displayOrder ASC, createdAt DESC
LIMIT ?
OFFSET ?
`;

export const BILLING_PLAN_COUNT = `
SELECT COUNT(*) AS count
FROM billing_plans
WHERE
  (? = 'all' OR status = ?)
  AND (
    ? IS NULL
    OR name LIKE '%' || ? || '%'
    OR code LIKE '%' || ? || '%'
  )
`;

export const BILLING_PLAN_FIND_PUBLISHED = `
SELECT *
FROM billing_plans
WHERE status = 'PUBLISHED'
ORDER BY displayOrder ASC, createdAt DESC
`;

export const BILLING_PLAN_GET_ALL = `
SELECT *
FROM billing_plans
`;
