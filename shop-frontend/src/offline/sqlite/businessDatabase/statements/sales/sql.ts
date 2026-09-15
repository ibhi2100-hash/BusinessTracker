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

export const BUYING_ANALYSIS = `
WITH

params AS (
    SELECT
        ? AS businessId,
        ? AS branchId,

        ? AS currentStart,
        ? AS currentEnd,

        ? AS previousStart,
        ? AS previousEnd,

        ? AS currentDays,
        ? AS previousDays
),

/* ============================================================
   CURRENT SALES
   ============================================================ */

current_sales AS (
    SELECT
        s.productId,

        SUM(
            CASE
                WHEN s.status = 'completed'
                THEN s.quantity
                ELSE 0
            END
        ) AS unitsSold,

        SUM(
            CASE
                WHEN s.status = 'completed'
                THEN s.profit
                ELSE 0
            END
        ) AS grossProfit
         COUNT(

            CASE

                WHEN s.status = 'completed'

                THEN 1

            END

        ) AS transactionCount

    FROM sales s

    JOIN params p
      ON s.businessId = p.businessId

    WHERE
        (
            p.branchId IS NULL
            OR s.branchId = p.branchId
        )

        AND s.createdAt >= p.currentStart
        AND s.createdAt <= p.currentEnd

    GROUP BY s.productId
),

/* ============================================================
   PREVIOUS PERIOD SALES
   ============================================================ */

previous_sales AS (
    SELECT
        s.productId,

        SUM(
            CASE
                WHEN s.status = 'completed'
                THEN s.quantity
                ELSE 0
            END
        ) AS unitsSold,

        SUM(
            CASE
                WHEN s.status = 'completed'
                THEN s.profit
                ELSE 0
            END
        ) AS grossProfit

         COUNT(

            CASE

                WHEN s.status = 'completed'

                THEN 1

            END

        ) AS transactionCount

    FROM sales s

    JOIN params p
      ON s.businessId = p.businessId

    WHERE
        (
            p.branchId IS NULL
            OR s.branchId = p.branchId
        )

        AND s.createdAt >= p.previousStart
        AND s.createdAt <= p.previousEnd

    GROUP BY s.productId
),

/* ============================================================
   INVENTORY
   ============================================================ */

inventory AS (
    SELECT
        i.productId,

        SUM(i.quantity) AS currentStock

    FROM inventories i

    JOIN params p
      ON i.businessId = p.businessId

    WHERE
        (
            p.branchId IS NULL
            OR i.branchId = p.branchId
        )

    GROUP BY i.productId
),

/* ============================================================
   PRODUCT BASE
   ============================================================ */

product_base AS (

    SELECT

        p.id AS productId,

        p.name AS productName,

        p.reorderLevel,

        p.costPrice,

        p.price,

        COALESCE(i.currentStock, 0)

            AS currentStock,

        COALESCE(cs.unitsSold, 0)

            AS unitsSold,

        COALESCE(cs.grossProfit, 0)

            AS grossProfit,

        COALESCE(cs.transactionCount, 0)

            AS transactionCount,

        COALESCE(ps.unitsSold, 0)

            AS previousUnitsSold,

        COALESCE(ps.grossProfit, 0)

            AS previousGrossProfit,

        COALESCE(ps.transactionCount, 0)

            AS previousTransactionCount

    FROM products p

    CROSS JOIN params x

    LEFT JOIN current_sales cs

        ON cs.productId = p.id

    LEFT JOIN previous_sales ps

        ON ps.productId = p.id

    LEFT JOIN inventory i

        ON i.productId = p.id

    WHERE

        p.businessId = x.businessId

        AND p.isDeleted = 0

        AND p.isActive = 1

        AND (

            x.branchId IS NULL

            OR p.branchId = x.branchId

        )

),

/* ============================================================

   VELOCITY METRICS

   ============================================================ */

velocity_metrics AS (

    SELECT

        pb.*,

        pb.unitsSold

            / NULLIF(

                (SELECT currentDays FROM params),

                0

            ) AS salesVelocity,

        pb.grossProfit

            / NULLIF(

                (SELECT currentDays FROM params),

                0

            ) AS grossProfitVelocity,

        pb.previousUnitsSold

            / NULLIF(

                (SELECT previousDays FROM params),

                0

            ) AS previousSalesVelocity,

        pb.previousGrossProfit

            / NULLIF(

                (SELECT previousDays FROM params),

                0

            ) AS previousGrossProfitVelocity

    FROM product_base pb

),

/* ============================================================

   DEMAND TREND

   ============================================================ */

trend_metrics AS (

    SELECT

        vm.*,

        CASE

            /* New demand */

            WHEN vm.previousSalesVelocity <= 0

                 AND vm.salesVelocity > 0

            THEN 1.0

            /* No demand */

            WHEN vm.previousSalesVelocity <= 0

                 AND vm.salesVelocity <= 0

            THEN 0.0

            /* Normal growth/decline */

            ELSE

                (

                    vm.salesVelocity

                    / vm.previousSalesVelocity

                ) - 1.0

        END AS demandGrowth

    FROM velocity_metrics vm

),

/* ============================================================

   VELOCITY PERCENTILES

   ============================================================ */

ranked_metrics AS (

    SELECT

        tm.*,

        PERCENT_RANK() OVER (

            ORDER BY tm.salesVelocity

        ) AS salesVelocityPercentile,

        PERCENT_RANK() OVER (

            ORDER BY tm.grossProfitVelocity

        ) AS grossProfitVelocityPercentile

    FROM trend_metrics tm

),

/* ============================================================

   NORMALIZED SCORES

   ============================================================ */

normalized_scores AS (

    SELECT

        rm.*,

        /* ----------------------------------------------------

           SALES VELOCITY SCORE

           ---------------------------------------------------- */

        ROUND(

            rm.salesVelocityPercentile * 100,

            2

        ) AS salesVelocityScore,

        /* ----------------------------------------------------

           GROSS PROFIT VELOCITY SCORE

           ---------------------------------------------------- */

        ROUND(

            rm.grossProfitVelocityPercentile * 100,

            2

        ) AS grossProfitVelocityScore,

        /* ----------------------------------------------------

           DEMAND TREND SCORE

           

           0% growth     = 50

           +100% growth  = 100

           -100% growth  = 0

           ---------------------------------------------------- */

        ROUND(

            MIN(

                100,

                MAX(

                    0,

                    50 + (rm.demandGrowth * 50)

                )

            ),

            2

        ) AS demandTrendScore,

        /* ----------------------------------------------------

           INVENTORY PRESSURE

           

           Stock >= reorder level = 0

           Stock = 0              = 100

           ---------------------------------------------------- */

        CASE

            WHEN rm.reorderLevel <= 0

            THEN 0

            ELSE ROUND(

                MIN(

                    100,

                    MAX(

                        0,

                        (

                            (

                                rm.reorderLevel

                                - rm.currentStock

                            ) * 100.0

                            / rm.reorderLevel

                        )

                    )

                ),

                2

            )

        END AS inventoryPressureScore,

        /* ----------------------------------------------------

           CONFIDENCE

           

           0 transactions  = 0

           20 transactions = 100

           

           This threshold can later become configurable.

           ---------------------------------------------------- */

        ROUND(

            MIN(

                100,

                (

                    (

                        rm.transactionCount

                        + rm.previousTransactionCount

                    ) * 100.0 / 20

                )

            ),

            2

        ) AS confidenceScore

    FROM ranked_metrics rm

)

/* ============================================================

   FINAL BUYING SCORE

   ============================================================ */

SELECT

    productId,

    productName,

    currentStock,

    reorderLevel,

    unitsSold,

    salesVelocity,

    grossProfit,

    grossProfitVelocity,

    previousUnitsSold,

    previousSalesVelocity,

    previousGrossProfit,

    previousGrossProfitVelocity,

    demandGrowth,

    transactionCount,

    previousTransactionCount,

    salesVelocityScore,

    grossProfitVelocityScore,

    demandTrendScore,

    inventoryPressureScore,

    confidenceScore,

    /* --------------------------------------------------------

       BUYING SCORE

       -------------------------------------------------------- */

    ROUND(

        (

            salesVelocityScore * 0.25

            +

            grossProfitVelocityScore * 0.20

            +

            demandTrendScore * 0.15

            +

            inventoryPressureScore * 0.20

            +

            confidenceScore * 0.10

        ),

        2

    ) AS buyingScore

FROM normalized_scores

ORDER BY buyingScore DESC

`;