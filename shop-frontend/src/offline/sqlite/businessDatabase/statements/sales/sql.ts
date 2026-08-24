// ============================================================
// sql.ts  (sales SQL)
// ============================================================

export const SALES_UPSERT = `
INSERT INTO sales (
    id,
    businessId,
    branchId,
    productId,
    productName,
    quantity,
    price,
    costPrice,
    unitCostPrice,
    unitPrice,     
    total,
    profit,
    paymentMethod,
    customerRef,
    note,
    status,
    saleGroupId,
    mode,
    createdAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
ON CONFLICT(id)
DO UPDATE SET
    businessId     = excluded.businessId,
    branchId       = excluded.branchId,
    productId      = excluded.productId,
    productName    = excluded.productName,
    quantity       = excluded.quantity,
    price          = excluded.price,
    costPrice      = excluded.costPrice,
    unitCostPrice  = excluded.unitCostPrice,
    unitPrice      = excluded.unitPrice,
    total          = excluded.total,
    profit         = excluded.profit,
    paymentMethod  = excluded.paymentMethod,
    customerRef    = excluded.customerRef,
    note           = excluded.note,
    status         = excluded.status,
    saleGroupId    = excluded.saleGroupId,
    mode           = excluded.mode,
    updatedAt      = excluded.updatedAt
`;

export const FIND_BY_ID = `
SELECT *
FROM sales
WHERE id = ?
LIMIT 1
`;

export const SALES_DELETE = `
DELETE FROM sales
WHERE id = ?
`;

export const SALES_UPDATE = `
UPDATE sales
SET
    quantity      = ?,
    price         = ?,
    costPrice     = ?,
    total         = ?,
    profit        = ?,
    status        = ?,
    note          = ?,
    updatedAt     = ?
WHERE id = ?
`;

export const FIND_ALL = `
SELECT *
FROM sales
ORDER BY createdAt DESC
`;

export const FIND_BY_BRANCH = `
SELECT *
FROM sales
WHERE branchId = ?
ORDER BY createdAt DESC
`;

export const FIND_BY_PRODUCT = `
SELECT *
FROM sales
WHERE productId = ?
ORDER BY createdAt DESC
`;

export const FIND_BY_DATE_RANGE = `
SELECT *
FROM sales
WHERE createdAt >= ?
  AND createdAt <= ?
  AND (? IS NULL OR branchId = ?)
  AND (? IS NULL OR status = ?)
ORDER BY createdAt DESC
LIMIT ?
OFFSET ?
`;

export const FIND_BY_GROUP = `
SELECT *
FROM sales
WHERE saleGroupId = ?
ORDER BY createdAt ASC
`;

export const SUMMARY_BY_DATE_RANGE = `
SELECT
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END), 0)          AS totalSales,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN costPrice ELSE 0 END), 0)      AS totalCost,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN profit ELSE 0 END), 0)         AS totalProfit,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END), 0)       AS totalQuantity,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0)              AS transactionCount,
    COALESCE(SUM(CASE WHEN status = 'voided' THEN 1 ELSE 0 END), 0)                 AS voidedCount,
    COALESCE(SUM(CASE WHEN status = 'refunded' THEN total ELSE 0 END), 0)           AS refundedAmount
FROM sales
WHERE createdAt >= ?
  AND createdAt <= ?
  AND (? IS NULL OR branchId = ?)
`;

export const GET_ALL_SALES =   `
SELECT * FROM sales
`