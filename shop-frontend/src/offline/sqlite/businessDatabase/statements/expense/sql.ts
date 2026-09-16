// sql.ts — Expense SQL

export const EXPENSE_UPSERT = `
INSERT INTO expenses (
  id,
  businessId,
  branchId,
  categoryId,
  categoryName,
  title,
  description,
  amount,
  paymentMethod,
  vendorRef,
  vendorId,
  userId,
  receiptRef,
  note,
  status,
  expenseGroupId,
  mode,
  incurredAt,
  createdAt,
  updatedAt
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
ON CONFLICT(id)
DO UPDATE SET
  businessId     = excluded.businessId,
  branchId       = excluded.branchId,
  categoryId     = excluded.categoryId,
  categoryName   = excluded.categoryName,
  title          = excluded.title,
  description    = excluded.description,
  amount         = excluded.amount,
  paymentMethod  = excluded.paymentMethod,
  vendorRef      = excluded.vendorRef,
  vendorId       = excluded.vendorId,
  userId         = excluded.userId,
  receiptRef     = excluded.receiptRef,
  note           = excluded.note,
  status         = excluded.status,
  expenseGroupId = excluded.expenseGroupId,
  mode           = excluded.mode,
  incurredAt     = excluded.incurredAt,
  createdAt      = excluded.createdAt,
  updatedAt      = excluded.updatedAt
`;

export const FIND_BY_ID = `
SELECT *
FROM expenses
WHERE id = ?
LIMIT 1
`;

export const EXPENSE_DELETE = `
DELETE FROM expenses
WHERE id = ?
`;

export const EXPENSE_UPDATE = `
UPDATE expenses
SET
  amount      = ?,
  status      = ?,
  note        = ?,
  updatedAt   = ?
WHERE id = ?
`;

export const FIND_ALL = `
SELECT *
FROM expenses
ORDER BY incurredAt DESC
`;

export const FIND_BY_BRANCH = `
SELECT *
FROM expenses
WHERE branchId = ?
ORDER BY incurredAt DESC
`;

export const FIND_BY_CATEGORY = `
SELECT *
FROM expenses
WHERE categoryId = ?
ORDER BY incurredAt DESC
`;

export const FIND_BY_GROUP = `
SELECT *
FROM expenses
WHERE expenseGroupId = ?
ORDER BY incurredAt ASC
`;

/**
 * Canonical list.
 * businessId is mandatory.
 * branchId / categoryId / from / to / status are optional filters.
 */
export const LIST_EXPENSES = `
SELECT
  id,
  businessId,
  branchId,
  categoryId,
  categoryName,
  title,
  description,
  amount,
  paymentMethod,
  vendorRef,
  vendorId,
  userId,
  receiptRef,
  note,
  status,
  expenseGroupId,
  mode,
  incurredAt,
  createdAt,
  updatedAt
FROM expenses
WHERE businessId = ?

  AND (
    ? IS NULL
    OR branchId = ?
  )

  AND (
    ? IS NULL
    OR categoryId = ?
  )

  AND (
    ? IS NULL
    OR incurredAt >= ?
  )

  AND (
    ? IS NULL
    OR incurredAt <= ?
  )

  AND (
    ? = 'all'
    OR status = ?
  )

ORDER BY incurredAt DESC
LIMIT ?
OFFSET ?
`;

export const COUNT_EXPENSES = `
SELECT COUNT(*) AS count
FROM expenses
WHERE businessId = ?

  AND (
    ? IS NULL
    OR branchId = ?
  )

  AND (
    ? IS NULL
    OR categoryId = ?
  )

  AND (
    ? IS NULL
    OR incurredAt >= ?
  )

  AND (
    ? IS NULL
    OR incurredAt <= ?
  )

  AND (
    ? = 'all'
    OR status = ?
  )
`;

export const SUMMARY_BY_DATE_RANGE = `
SELECT
  COALESCE(
    SUM(
      CASE WHEN status = 'recorded' THEN amount ELSE 0 END
    ),
    0
  ) AS totalAmount,

  COALESCE(
    SUM(
      CASE WHEN status = 'recorded' THEN 1 ELSE 0 END
    ),
    0
  ) AS recordedCount,

  COALESCE(
    SUM(
      CASE WHEN status = 'voided' THEN 1 ELSE 0 END
    ),
    0
  ) AS voidedCount,

  COALESCE(
    SUM(
      CASE WHEN status = 'reimbursed' THEN amount ELSE 0 END
    ),
    0
  ) AS reimbursedAmount

FROM expenses
WHERE incurredAt >= ?
  AND incurredAt <= ?
  AND (
    ? IS NULL
    OR branchId = ?
  )
`;

export const SUMMARY_BY_CATEGORY = `
SELECT
  categoryId,
  categoryName,
  COALESCE(
    SUM(
      CASE WHEN status = 'recorded' THEN amount ELSE 0 END
    ),
    0
  ) AS totalAmount,
  COALESCE(
    SUM(
      CASE WHEN status = 'recorded' THEN 1 ELSE 0 END
    ),
    0
  ) AS transactionCount
FROM expenses
WHERE businessId = ?
  AND incurredAt >= ?
  AND incurredAt <= ?
  AND (
    ? IS NULL
    OR branchId = ?
  )
  AND status = 'recorded'
GROUP BY categoryId, categoryName
ORDER BY totalAmount DESC
`;

export const GET_ALL_EXPENSES = `
SELECT *
FROM expenses
ORDER BY incurredAt DESC
`;