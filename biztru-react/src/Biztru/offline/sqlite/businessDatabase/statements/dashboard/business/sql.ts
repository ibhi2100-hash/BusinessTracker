
/* ================================================================
   BUSINESS-WIDE INFORMATION
   All queries are scoped by businessId.
   ================================================================ */

/* BUSINESS PROFILE */
export const BUSINESS_PROFILE = `
  SELECT *
  FROM businesses
  WHERE id = ?
  LIMIT 1
`;

/* ALL BUSINESS BRANCHES */
export const BUSINESS_BRANCHES = `
  SELECT *
  FROM branches
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* ALL BUSINESS PRODUCTS */
export const BUSINESS_PRODUCTS = `
  SELECT *
  FROM products
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* ALL BRANCH INVENTORY */
export const BUSINESS_INVENTORY = `
  SELECT *
  FROM inventories
  WHERE businessId = ?
  ORDER BY branchId, productId
`;

/* ALL BUSINESS EMPLOYEES */
export const BUSINESS_EMPLOYEES = `
  SELECT *
  FROM employees
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* ================================================================
   BUSINESS-WIDE FINANCIAL DASHBOARD
   All financial queries are scoped by businessId.
   ================================================================ */


/* ================================================================
   1. BUSINESS DASHBOARD BALANCES
   Returns current account balances across all branches.
   Parameter: businessId
   ================================================================ */

export const BUSINESS_DASHBOARD_BALANCES = `
    SELECT
        COALESCE(SUM(
            CASE
                WHEN account = 'CASH' AND direction = 'DEBIT'
                    THEN amount
                WHEN account = 'CASH' AND direction = 'CREDIT'
                    THEN -amount
                ELSE 0
            END
        ), 0) AS cash,

        COALESCE(SUM(
            CASE
                WHEN account = 'BANK' AND direction = 'DEBIT'
                    THEN amount
                WHEN account = 'BANK' AND direction = 'CREDIT'
                    THEN -amount
                ELSE 0
            END
        ), 0) AS bank,

        COALESCE(SUM(
            CASE
                WHEN account = 'INVENTORY' AND direction = 'DEBIT'
                    THEN amount
                WHEN account = 'INVENTORY' AND direction = 'CREDIT'
                    THEN -amount
                ELSE 0
            END
        ), 0) AS inventoryValue,

        COALESCE(SUM(
            CASE
                WHEN account = 'LIABILITIES' AND direction = 'CREDIT'
                    THEN amount
                WHEN account = 'LIABILITIES' AND direction = 'DEBIT'
                    THEN -amount
                ELSE 0
            END
        ), 0) AS liabilities,

        COALESCE(SUM(
            CASE
                WHEN account = 'OWNER_CAPITAL' AND direction = 'CREDIT'
                    THEN amount
                WHEN account = 'OWNER_CAPITAL' AND direction = 'DEBIT'
                    THEN -amount
                ELSE 0
            END
        ), 0) AS ownerCapital,

        COALESCE(SUM(
            CASE
                WHEN account = 'OWNER_DRAWINGS' AND direction = 'DEBIT'
                    THEN amount
                WHEN account = 'OWNER_DRAWINGS' AND direction = 'CREDIT'
                    THEN -amount
                ELSE 0
            END
        ), 0) AS ownerDrawings

    FROM ledger

    WHERE businessId = ?;
`;


/* ================================================================
   2. BUSINESS DASHBOARD REVENUE
   Revenue within a selected reporting period.
   Parameters: businessId, periodStart, periodEnd
   ================================================================ */

export const BUSINESS_DASHBOARD_REVENUE = `
    SELECT
        COALESCE(SUM(amount), 0) AS revenue

    FROM ledger

    WHERE businessId = ?
      AND account = 'REVENUE'
      AND direction = 'CREDIT'
      AND createdAt >= ?
      AND createdAt < ?;
`;


/* ================================================================
   3. BUSINESS DASHBOARD COGS
   Cost of goods sold within a selected reporting period.
   Parameters: businessId, periodStart, periodEnd
   ================================================================ */

export const BUSINESS_DASHBOARD_COGS = `
    SELECT
        COALESCE(SUM(amount), 0) AS cogs

    FROM ledger

    WHERE businessId = ?
      AND account = 'COGS'
      AND direction = 'DEBIT'
      AND createdAt >= ?
      AND createdAt < ?;
`;


/* ================================================================
   4. BUSINESS DASHBOARD EXPENSES
   Operating expenses within a selected reporting period.
   Parameters: businessId, periodStart, periodEnd
   ================================================================ */

export const BUSINESS_DASHBOARD_EXPENSES = `
    SELECT
        COALESCE(SUM(amount), 0) AS expenses

    FROM ledger

    WHERE businessId = ?
      AND account = 'EXPENSE'
      AND direction = 'DEBIT'
      AND createdAt >= ?
      AND createdAt < ?;
`;


/* ================================================================
   5. BUSINESS DASHBOARD TODAY SALES
   Revenue generated across all branches today.
   Parameters: businessId, todayStart, todayEnd
   ================================================================ */

export const BUSINESS_DASHBOARD_TODAY_SALES = `
    SELECT
        COALESCE(SUM(amount), 0) AS todaySales,

        COUNT(*) AS salesCount

    FROM ledger

    WHERE businessId = ?
      AND account = 'REVENUE'
      AND direction = 'CREDIT'
      AND createdAt >= ?
      AND createdAt < ?;
`;


/* ================================================================
   6. BUSINESS DASHBOARD BRANCH COUNT
   Parameters: businessId
   ================================================================ */

export const BUSINESS_DASHBOARD_BRANCH_COUNT = `
    SELECT
        COUNT(*) AS branchCount,

        SUM(
            CASE
                WHEN isActive = 1 THEN 1
                ELSE 0
            END
        ) AS activeBranches,

        SUM(
            CASE
                WHEN isActive = 0 THEN 1
                ELSE 0
            END
        ) AS inactiveBranches

    FROM branches

    WHERE businessId = ?;
`;


/* ================================================================
   7. BUSINESS DASHBOARD PRODUCT COUNT
   Parameters: businessId
   ================================================================ */

export const BUSINESS_DASHBOARD_PRODUCT_COUNT = `
    SELECT
        COUNT(*) AS productCount

    FROM products

    WHERE businessId = ?;
`;


/* ================================================================
   8. BUSINESS DASHBOARD INVENTORY
   Aggregates inventory across all branches.
   Uses branch_inventory, consistent with BUSINESS_INVENTORY.
   Parameters: businessId
   ================================================================ */

export const BUSINESS_DASHBOARD_INVENTORY = `
    SELECT
        COUNT(DISTINCT productId) AS stockedProducts,

        COALESCE(SUM(quantity), 0) AS totalUnits,

        SUM(
            CASE
                WHEN quantity <= 0 THEN 1
                ELSE 0
            END
        ) AS outOfStockRows,

        SUM(
            CASE
                WHEN quantity > 0 THEN 1
                ELSE 0
            END
        ) AS inStockRows

    FROM inventories

    WHERE businessId = ?;
`;


/* ================================================================
   9. BUSINESS DASHBOARD SUMMARY
   Returns a consolidated business snapshot.
   Parameter: businessId
   ================================================================ */

export const BUSINESS_DASHBOARD_SUMMARY = `
    SELECT

        /* Financial balances */

        COALESCE((
            SELECT SUM(
                CASE
                    WHEN account = 'CASH' AND direction = 'DEBIT'
                        THEN amount
                    WHEN account = 'CASH' AND direction = 'CREDIT'
                        THEN -amount
                    ELSE 0
                END
            )
            FROM ledger
            WHERE businessId = ?
        ), 0) AS cash,

        COALESCE((
            SELECT SUM(
                CASE
                    WHEN account = 'BANK' AND direction = 'DEBIT'
                        THEN amount
                    WHEN account = 'BANK' AND direction = 'CREDIT'
                        THEN -amount
                    ELSE 0
                END
            )
            FROM ledger
            WHERE businessId = ?
        ), 0) AS bank,

        COALESCE((
            SELECT SUM(
                CASE
                    WHEN account = 'INVENTORY' AND direction = 'DEBIT'
                        THEN amount
                    WHEN account = 'INVENTORY' AND direction = 'CREDIT'
                        THEN -amount
                    ELSE 0
                END
            )
            FROM ledger
            WHERE businessId = ?
        ), 0) AS inventoryValue,

        COALESCE((
            SELECT SUM(
                CASE
                    WHEN account = 'LIABILITIES' AND direction = 'CREDIT'
                        THEN amount
                    WHEN account = 'LIABILITIES' AND direction = 'DEBIT'
                        THEN -amount
                    ELSE 0
                END
            )
            FROM ledger
            WHERE businessId = ?
        ), 0) AS liabilities,

        /* Business structure */

        (
            SELECT COUNT(*)
            FROM branches
            WHERE businessId = ?
        ) AS branchCount,

        (
            SELECT COUNT(*)
            FROM branches
            WHERE businessId = ?
              AND isActive = 1
        ) AS activeBranches,

        (
            SELECT COUNT(*)
            FROM products
            WHERE businessId = ?
        ) AS productCount,

        (
            SELECT COUNT(*)
            FROM employees
            WHERE businessId = ?
              AND employmentStatus = 'ACTIVE'
        ) AS employeeCount,

        /* Inventory */

        (
            SELECT COALESCE(SUM(quantity), 0)
            FROM inventories
            WHERE businessId = ?
        ) AS totalInventoryUnits,

        (
            SELECT COUNT(DISTINCT productId)
            FROM inventories
            WHERE businessId = ?
              AND quantity > 0
        ) AS stockedProducts,

        (
            SELECT COUNT(*)
            FROM inventories
            WHERE businessId = ?
              AND quantity <= 0
        ) AS outOfStockRows;
`;


/* ALL BUSINESS CUSTOMERS */
export const BUSINESS_CUSTOMERS = `
  SELECT *
  FROM customers
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* ALL BUSINESS SUPPLIERS */
export const BUSINESS_SUPPLIERS = `
  SELECT *
  FROM suppliers
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* ALL BUSINESS SALES */
export const BUSINESS_SALES = `
  SELECT *
  FROM sales
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* ALL BUSINESS LEDGER ENTRIES */
export const BUSINESS_LEDGER = `
  SELECT *
  FROM ledger
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;

/* BUSINESS-WIDE EXPENSES */
export const BUSINESS_EXPENSES = `
  SELECT *
  FROM expenses
  WHERE businessId = ?
  ORDER BY createdAt DESC
`;



/* ================================================================
   BUSINESS BRANCH PERFORMANCE
   Scope: All branches belonging to one business.

   Returns:
   - Branch identity and details
   - Branch activation status
   - Manager placeholder
   - Today's sales
   - Period revenue
   - Period net profit
   - Inventory value
   - Cash balance
   - Sales count (ledger-entry proxy)

   Parameters:
   1. businessId
   2. periodStart
   3. periodEnd
   4. todayStart
   5. todayEnd
   6. businessId
   ================================================================ */


export const BUSINESS_BRANCH_PERFORMANCE = `
WITH

/* =========================================================
   1. BRANCH FINANCIAL PERFORMANCE
   Aggregates ledger data for every branch in the business.
   ========================================================= */

branch_financials AS (
    SELECT
        l.branchId,

        /* Cash balance */
        SUM(
            CASE
                WHEN l.account = 'CASH' AND l.direction = 'DEBIT'
                    THEN l.amount
                WHEN l.account = 'CASH' AND l.direction = 'CREDIT'
                    THEN -l.amount
                ELSE 0
            END
        ) AS cash,

        /* Bank balance */
        SUM(
            CASE
                WHEN l.account = 'BANK' AND l.direction = 'DEBIT'
                    THEN l.amount
                WHEN l.account = 'BANK' AND l.direction = 'CREDIT'
                    THEN -l.amount
                ELSE 0
            END
        ) AS bank,

        /* Inventory value */
        SUM(
            CASE
                WHEN l.account = 'INVENTORY' AND l.direction = 'DEBIT'
                    THEN l.amount
                WHEN l.account = 'INVENTORY' AND l.direction = 'CREDIT'
                    THEN -l.amount
                ELSE 0
            END
        ) AS inventoryValue,

        /* Revenue within selected reporting period */
        SUM(
            CASE
                WHEN l.account = 'REVENUE'
                 AND l.direction = 'CREDIT'
                 AND l.createdAt >= ?
                 AND l.createdAt < ?
                THEN l.amount
                ELSE 0
            END
        ) AS revenue,

        /* Cost of goods sold within selected period */
        SUM(
            CASE
                WHEN l.account = 'COGS'
                 AND l.direction = 'DEBIT'
                 AND l.createdAt >= ?
                 AND l.createdAt < ?
                THEN l.amount
                ELSE 0
            END
        ) AS cogs,

        /* Operating expenses within selected period */
        SUM(
            CASE
                WHEN l.account = 'EXPENSE'
                 AND l.direction = 'DEBIT'
                 AND l.createdAt >= ?
                 AND l.createdAt < ?
                THEN l.amount
                ELSE 0
            END
        ) AS expenses,

        /* Today's revenue */
        SUM(
            CASE
                WHEN l.account = 'REVENUE'
                 AND l.direction = 'CREDIT'
                 AND l.createdAt >= ?
                 AND l.createdAt < ?
                THEN l.amount
                ELSE 0
            END
        ) AS todaySales,

        /* Today's revenue ledger entries.
           This is a proxy, not necessarily unique sales transactions. */
        SUM(
            CASE
                WHEN l.account = 'REVENUE'
                 AND l.direction = 'CREDIT'
                 AND l.createdAt >= ?
                 AND l.createdAt < ?
                THEN 1
                ELSE 0
            END
        ) AS salesCount

    FROM ledger l

    WHERE l.businessId = ?

    GROUP BY l.branchId
),

/* =========================================================
   2. BRANCH INVENTORY PERFORMANCE
   ========================================================= */

branch_inventory AS (
    SELECT
        i.branchId,

        COUNT(DISTINCT i.productId) AS totalProducts,

        COALESCE(SUM(i.quantity), 0) AS totalUnits,

        SUM(
            CASE
                WHEN i.quantity <= 0 THEN 1
                ELSE 0
            END
        ) AS outOfStockRows

    FROM inventories i

    WHERE i.businessId = ?

    GROUP BY i.branchId
),

/* =========================================================
   3. BRANCH MANAGERS
   Returns active employees with the MANAGER role.
   GROUP_CONCAT prevents duplicate branch rows when a branch
   has more than one active manager.
   ========================================================= */

branch_managers AS (
    SELECT
        e.businessId,
        e.branchId,

        GROUP_CONCAT(
            DISTINCT e.fullName
        ) AS manager

    FROM employees e

    WHERE e.businessId = ?
      AND e.role = 'MANAGER'
      AND e.employmentStatus = 'ACTIVE'
      AND e.branchId IS NOT NULL

    GROUP BY
        e.businessId,
        e.branchId
)

/* =========================================================
   4. FINAL BUSINESS BRANCH PERFORMANCE
   ========================================================= */

SELECT

    /* Branch identity */
    b.id,
    b.businessId,
    b.name,
    COALESCE(b.address, '') AS location,
    b.phone,
    b.isActive,
    b.isDefault,
    b.createdAt,

    /* Branch status */
    CASE
        WHEN b.isActive = 0 THEN 'INACTIVE'

        WHEN COALESCE(bf.cash, 0) < 0
        OR (
            COALESCE(bf.revenue, 0)
            - COALESCE(bf.cogs, 0)
            - COALESCE(bf.expenses, 0)
        ) < 0
        OR COALESCE(bi.outOfStockRows, 0) > 0
        THEN 'ATTENTION'

        ELSE 'ACTIVE'
    END AS status,

    /* Branch manager */
    COALESCE(bm.manager, 'Unassigned') AS manager,

    /* Financial performance */
    COALESCE(bf.cash, 0) AS cash,

    COALESCE(bf.bank, 0) AS bank,

    COALESCE(bf.inventoryValue, 0) AS inventoryValue,

    COALESCE(bf.revenue, 0) AS revenue,

    COALESCE(bf.cogs, 0) AS cogs,

    COALESCE(bf.expenses, 0) AS expenses,

    (
        COALESCE(bf.revenue, 0)
        - COALESCE(bf.cogs, 0)
    ) AS grossProfit,

    (
        COALESCE(bf.revenue, 0)
        - COALESCE(bf.cogs, 0)
        - COALESCE(bf.expenses, 0)
    ) AS netProfit,

    /* Today's performance */
    COALESCE(bf.todaySales, 0) AS todaySales,

    COALESCE(bf.salesCount, 0) AS salesCount,

    /* Inventory performance */
    COALESCE(bi.totalProducts, 0) AS totalProducts,

    COALESCE(bi.totalUnits, 0) AS totalUnits,

    COALESCE(bi.outOfStockRows, 0) AS outOfStockRows

FROM branches b

LEFT JOIN branch_financials bf
    ON bf.branchId = b.id

LEFT JOIN branch_inventory bi
    ON bi.branchId = b.id

LEFT JOIN branch_managers bm
    ON bm.businessId = b.businessId
   AND bm.branchId = b.id

WHERE b.businessId = ?

ORDER BY b.createdAt DESC;
`;



/* ================================================================
   BUSINESS-WIDE PERFORMANCE
   Aggregates financial performance across all branches.

   Parameters:
   1. businessId
   2. periodStart
   3. periodEnd
   ================================================================ */

export const BUSINESS_PERFORMANCE = `
    SELECT

        /* Revenue */
        COALESCE(SUM(
            CASE
                WHEN account = 'REVENUE'
                 AND direction = 'CREDIT'
                THEN amount
                ELSE 0
            END
        ), 0) AS revenue,

        /* Cost of goods sold */
        COALESCE(SUM(
            CASE
                WHEN account = 'COGS'
                 AND direction = 'DEBIT'
                THEN amount
                ELSE 0
            END
        ), 0) AS cogs,

        /* Operating expenses */
        COALESCE(SUM(
            CASE
                WHEN account = 'EXPENSE'
                 AND direction = 'DEBIT'
                THEN amount
                ELSE 0
            END
        ), 0) AS expenses,

        /* Gross profit */
        (
            COALESCE(SUM(
                CASE
                    WHEN account = 'REVENUE'
                     AND direction = 'CREDIT'
                    THEN amount
                    ELSE 0
                END
            ), 0)
            -
            COALESCE(SUM(
                CASE
                    WHEN account = 'COGS'
                     AND direction = 'DEBIT'
                    THEN amount
                    ELSE 0
                END
            ), 0)
        ) AS grossProfit,

        /* Net profit */
        (
            COALESCE(SUM(
                CASE
                    WHEN account = 'REVENUE'
                     AND direction = 'CREDIT'
                    THEN amount
                    ELSE 0
                END
            ), 0)
            -
            COALESCE(SUM(
                CASE
                    WHEN account = 'COGS'
                     AND direction = 'DEBIT'
                    THEN amount
                    ELSE 0
                END
            ), 0)
            -
            COALESCE(SUM(
                CASE
                    WHEN account = 'EXPENSE'
                     AND direction = 'DEBIT'
                    THEN amount
                    ELSE 0
                END
            ), 0)
        ) AS netProfit

    FROM ledger

    WHERE businessId = ?
      AND createdAt >= ?
      AND createdAt < ?;
`;
