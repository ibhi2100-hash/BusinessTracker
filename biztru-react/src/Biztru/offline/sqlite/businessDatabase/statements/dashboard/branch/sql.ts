
/* ================================================================
   BRANCH DASHBOARD SQL
   Scope: One branch belonging to one business.
   ================================================================ */


/* ----------------------------------------------------------------
   BRANCH ACCOUNT BALANCES
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_BALANCES = `
  SELECT
    account,

    COALESCE(
      SUM(
        CASE
          WHEN direction = 'DEBIT' THEN amount
          ELSE -amount
        END
      ),
      0
    ) AS balance

  FROM ledger

  WHERE businessId = ?
    AND branchId = ?

    AND account IN (
      'CASH',
      'BANK',
      'INVENTORY',
      'LIABILITIES',
      'OWNER_CAPITAL',
      'OWNER_DRAWINGS'
    )

  GROUP BY account
`;


/* ----------------------------------------------------------------
   BRANCH REVENUE
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_REVENUE = `
  SELECT
    COALESCE(SUM(amount), 0) AS total

  FROM ledger

  WHERE businessId = ?
    AND branchId = ?
    AND account = 'REVENUE'
    AND direction = 'CREDIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;


/* ----------------------------------------------------------------
   BRANCH COGS
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_COGS = `
  SELECT
    COALESCE(SUM(amount), 0) AS total

  FROM ledger

  WHERE businessId = ?
    AND branchId = ?
    AND account = 'COGS'
    AND direction = 'DEBIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;


/* ----------------------------------------------------------------
   BRANCH EXPENSES
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_EXPENSES = `
  SELECT
    COALESCE(SUM(amount), 0) AS total

  FROM ledger

  WHERE businessId = ?
    AND branchId = ?
    AND account = 'EXPENSE'
    AND direction = 'DEBIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;


/* ----------------------------------------------------------------
   BRANCH TODAY SALES
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_TODAY_SALES = `
  SELECT
    COALESCE(SUM(amount), 0) AS total

  FROM ledger

  WHERE businessId = ?
    AND branchId = ?
    AND account = 'REVENUE'
    AND direction = 'CREDIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;


/* ----------------------------------------------------------------
   BRANCH INVENTORY SUMMARY
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_INVENTORY = `
  SELECT

    COUNT(DISTINCT productId) AS stockedProducts,

    COALESCE(SUM(quantity), 0) AS totalUnits,

    COUNT(
      CASE
        WHEN quantity <= 0 THEN 1
      END
    ) AS outOfStockRows

  FROM inventories

  WHERE businessId = ?
    AND branchId = ?
`;


/* ----------------------------------------------------------------
   BRANCH PRODUCT COUNT
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_PRODUCT_COUNT = `
  SELECT
    COUNT(DISTINCT productId) AS totalProducts

  FROM inventories

  WHERE businessId = ?
    AND branchId = ?
`;


/* ----------------------------------------------------------------
   COMPLETE BRANCH DASHBOARD SUMMARY
   ---------------------------------------------------------------- */

export const BRANCH_DASHBOARD_SUMMARY = `
  WITH ledger_data AS (
    SELECT
      account,
      direction,
      amount,
      createdAt

    FROM ledger

    WHERE businessId = ?
      AND branchId = ?
  ),

  balances AS (
    SELECT
      account,

      SUM(
        CASE
          WHEN direction = 'DEBIT' THEN amount
          ELSE -amount
        END
      ) AS balance

    FROM ledger_data

    WHERE account IN (
      'CASH',
      'BANK',
      'INVENTORY',
      'LIABILITIES',
      'OWNER_CAPITAL',
      'OWNER_DRAWINGS'
    )

    GROUP BY account
  ),

  period AS (
    SELECT

      COALESCE(
        SUM(
          CASE
            WHEN account = 'REVENUE'
             AND direction = 'CREDIT'
            THEN amount
            ELSE 0
          END
        ),
        0
      ) AS revenue,

      COALESCE(
        SUM(
          CASE
            WHEN account = 'COGS'
             AND direction = 'DEBIT'
            THEN amount
            ELSE 0
          END
        ),
        0
      ) AS cogs,

      COALESCE(
        SUM(
          CASE
            WHEN account = 'EXPENSE'
             AND direction = 'DEBIT'
            THEN amount
            ELSE 0
          END
        ),
        0
      ) AS expenses

    FROM ledger_data

    WHERE createdAt >= ?
      AND createdAt <= ?
  ),

  inventory_stats AS (
    SELECT

      COUNT(DISTINCT productId) AS stockedProducts,

      COALESCE(SUM(quantity), 0) AS totalUnits,

      COUNT(
        CASE
          WHEN quantity <= 0 THEN 1
        END
      ) AS outOfStockRows

    FROM inventories

    WHERE businessId = ?
      AND branchId = ?
  )

  SELECT

    COALESCE(
      (SELECT balance FROM balances WHERE account = 'CASH'),
      0
    ) AS cash,

    COALESCE(
      (SELECT balance FROM balances WHERE account = 'BANK'),
      0
    ) AS bank,

    COALESCE(
      (SELECT balance FROM balances WHERE account = 'INVENTORY'),
      0
    ) AS inventoryValue,

    COALESCE(
      (SELECT balance FROM balances WHERE account = 'LIABILITIES'),
      0
    ) AS liabilities,

    COALESCE(
      (SELECT balance FROM balances WHERE account = 'OWNER_CAPITAL'),
      0
    ) AS ownerCapital,

    COALESCE(
      (SELECT balance FROM balances WHERE account = 'OWNER_DRAWINGS'),
      0
    ) AS ownerDrawings,

    (SELECT revenue FROM period) AS revenue,

    (SELECT cogs FROM period) AS cogs,

    (SELECT expenses FROM period) AS expenses,

    (
      SELECT revenue - cogs
      FROM period
    ) AS grossProfit,

    (
      SELECT revenue - cogs - expenses
      FROM period
    ) AS netProfit,

    (
      SELECT stockedProducts
      FROM inventory_stats
    ) AS stockedProducts,

    (
      SELECT totalUnits
      FROM inventory_stats
    ) AS totalUnits,

    (
      SELECT outOfStockRows
      FROM inventory_stats
    ) AS outOfStockRows
`;
