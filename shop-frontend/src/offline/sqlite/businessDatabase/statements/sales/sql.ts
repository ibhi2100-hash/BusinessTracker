// ============================================================
// sql.ts — Sales SQL
// ============================================================

/**
 * Insert or update a projected sale.
 *
 * One row represents one sale line.
 */
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
    customerId,
    userId,
    invoiceId,
    note,
    status,
    saleGroupId,
    mode,
    createdAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
    customerId     = excluded.customerId,
    userId         = excluded.userId,
    invoiceId      = excluded.invoiceId,
    note           = excluded.note,
    status         = excluded.status,
    saleGroupId    = excluded.saleGroupId,
    mode           = excluded.mode,
    createdAt      = excluded.createdAt,
    updatedAt      = excluded.updatedAt
`;


/**
 * Find one sale.
 */
export const FIND_BY_ID = `
SELECT *
FROM sales
WHERE id = ?
LIMIT 1
`;


/**
 * Delete one sale projection.
 *
 * Normally you should prefer domain events such as
 * SALE_VOIDED / SALE_REFUNDED over physical deletion.
 */
export const SALES_DELETE = `
DELETE FROM sales
WHERE id = ?
`;


/**
 * Update mutable sale fields.
 */
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


/**
 * Unscoped query.
 *
 * Use only for internal/debugging purposes.
 *
 * Application-facing code should normally use LIST_SALES,
 * which requires businessId.
 */
export const FIND_ALL = `
SELECT *
FROM sales
ORDER BY createdAt DESC
`;


/**
 * Find sales for one branch.
 *
 * Kept for specialized repository operations.
 *
 * NOTE:
 * Application code that needs business isolation should
 * prefer LIST_SALES.
 */
export const FIND_BY_BRANCH = `
SELECT *
FROM sales
WHERE branchId = ?
ORDER BY createdAt DESC
`;


/**
 * Find sales for one product.
 *
 * Kept for specialized operations.
 */
export const FIND_BY_PRODUCT = `
SELECT *
FROM sales
WHERE productId = ?
ORDER BY createdAt DESC
`;


/**
 * Find sales belonging to one checkout/cart.
 */
export const FIND_BY_GROUP = `
SELECT *
FROM sales
WHERE saleGroupId = ?
ORDER BY createdAt ASC
`;


/**
 * Canonical sales listing query.
 *
 * IMPORTANT:
 *
 * businessId is mandatory.
 *
 * branchId:
 *   null -> all branches belonging to the business
 *   value -> specific branch
 *
 * productId:
 *   null -> all products
 *   value -> specific product
 *
 * from:
 *   null -> no lower date bound
 *
 * to:
 *   null -> no upper date bound
 *
 * status:
 *   'all' -> every status
 *   value -> specific status
 *
 * limit/offset:
 *   pagination
 */
export const LIST_SALES = `
SELECT
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
FROM sales
WHERE businessId = ?

  AND (
      ? IS NULL
      OR branchId = ?
  )

  AND (
      ? IS NULL
      OR productId = ?
  )

  AND (
      ? IS NULL
      OR createdAt >= ?
  )

  AND (
      ? IS NULL
      OR createdAt <= ?
  )

  AND (
      ? = 'all'
      OR status = ?
  )

ORDER BY createdAt DESC

LIMIT ?
OFFSET ?
`;


/**
 * Count sales matching the same filters.
 *
 * This is useful for:
 *
 *   "Showing 200 of 8,421 sales"
 *
 * and proper pagination.
 */
export const COUNT_SALES = `
SELECT COUNT(*) AS count
FROM sales
WHERE businessId = ?

  AND (
      ? IS NULL
      OR branchId = ?
  )

  AND (
      ? IS NULL
      OR productId = ?
  )

  AND (
      ? IS NULL
      OR createdAt >= ?
  )

  AND (
      ? IS NULL
      OR createdAt <= ?
  )

  AND (
      ? = 'all'
      OR status = ?
  )
`;


/**
 * Financial summary for a period.
 *
 * Date boundaries and branch are optional at repository level,
 * but this query assumes the repository supplies effective
 * boundaries.
 */
export const SUMMARY_BY_DATE_RANGE = `
SELECT
    COALESCE(
        SUM(
            CASE
                WHEN status = 'completed'
                THEN total
                ELSE 0
            END
        ),
        0
    ) AS totalSales,

    COALESCE(
        SUM(
            CASE
                WHEN status = 'completed'
                THEN costPrice
                ELSE 0
            END
        ),
        0
    ) AS totalCost,

    COALESCE(
        SUM(
            CASE
                WHEN status = 'completed'
                THEN profit
                ELSE 0
            END
        ),
        0
    ) AS totalProfit,

    COALESCE(
        SUM(
            CASE
                WHEN status = 'completed'
                THEN quantity
                ELSE 0
            END
        ),
        0
    ) AS totalQuantity,

    COALESCE(
        SUM(
            CASE
                WHEN status = 'completed'
                THEN 1
                ELSE 0
            END
        ),
        0
    ) AS transactionCount,

    COALESCE(
        SUM(
            CASE
                WHEN status = 'voided'
                THEN 1
                ELSE 0
            END
        ),
        0
    ) AS voidedCount,

    COALESCE(
        SUM(
            CASE
                WHEN status = 'refunded'
                THEN total
                ELSE 0
            END
        ),
        0
    ) AS refundedAmount

FROM sales

WHERE createdAt >= ?
  AND createdAt <= ?

  AND (
      ? IS NULL
      OR branchId = ?
  )
`;


/**
 * Raw/internal access.
 *
 * Prefer LIST_SALES for application reads.
 */
export const GET_ALL_SALES = `
SELECT *
FROM sales
ORDER BY createdAt DESC
`;