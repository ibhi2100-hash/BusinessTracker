// statements/report/sql.ts

export const REPORT_PERIOD_SUMMARY = `
  WITH balances AS (
    SELECT
      account,
      SUM(CASE WHEN direction = 'DEBIT' THEN amount ELSE -amount END) AS balance
    FROM ledger
    WHERE branchId = ?
      AND account IN ('CASH','BANK','INVENTORY','LIABILITIES','OWNER_CAPITAL','OWNER_DRAWINGS')
    GROUP BY account
  ),
  period AS (
    SELECT
      COALESCE(SUM(CASE WHEN account = 'REVENUE' AND direction = 'CREDIT' THEN amount END), 0) AS revenue,
      COALESCE(SUM(CASE WHEN account = 'COGS'    AND direction = 'DEBIT'  THEN amount END), 0) AS cogs,
      COALESCE(SUM(CASE WHEN account = 'EXPENSE' AND direction = 'DEBIT'  THEN amount END), 0) AS expenses
    FROM ledger
    WHERE branchId = ?
      AND createdAt >= ?
      AND createdAt <= ?
  )
  SELECT
    COALESCE((SELECT balance FROM balances WHERE account = 'CASH'), 0)           AS cash,
    COALESCE((SELECT balance FROM balances WHERE account = 'BANK'), 0)           AS bank,
    COALESCE((SELECT balance FROM balances WHERE account = 'INVENTORY'), 0)      AS inventoryValue,
    COALESCE((SELECT balance FROM balances WHERE account = 'LIABILITIES'), 0)    AS liabilities,
    COALESCE((SELECT balance FROM balances WHERE account = 'OWNER_CAPITAL'), 0)  AS ownerCapital,
    COALESCE((SELECT balance FROM balances WHERE account = 'OWNER_DRAWINGS'), 0) AS ownerDrawings,
    (SELECT revenue  FROM period) AS revenue,
    (SELECT cogs     FROM period) AS cogs,
    (SELECT expenses FROM period) AS expenses
`;

export const REPORT_MONTHLY_BREAKDOWN = `
  SELECT
    strftime('%Y-%m', datetime(createdAt / 1000, 'unixepoch')) AS month,
    COALESCE(SUM(CASE WHEN account = 'REVENUE' AND direction = 'CREDIT' THEN amount END), 0) AS revenue,
    COALESCE(SUM(CASE WHEN account = 'COGS'    AND direction = 'DEBIT'  THEN amount END), 0) AS cogs,
    COALESCE(SUM(CASE WHEN account = 'EXPENSE' AND direction = 'DEBIT'  THEN amount END), 0) AS expenses
  FROM ledger
  WHERE branchId = ?
    AND createdAt >= ?
    AND createdAt <= ?
  GROUP BY month
  ORDER BY month ASC
`;

export const REPORT_YEARLY_BREAKDOWN = `
  SELECT
    CAST(strftime('%Y', datetime(createdAt / 1000, 'unixepoch')) AS INTEGER) AS year,
    COALESCE(SUM(CASE WHEN account = 'REVENUE' AND direction = 'CREDIT' THEN amount END), 0) AS revenue,
    COALESCE(SUM(CASE WHEN account = 'COGS'    AND direction = 'DEBIT'  THEN amount END), 0) AS cogs,
    COALESCE(SUM(CASE WHEN account = 'EXPENSE' AND direction = 'DEBIT'  THEN amount END), 0) AS expenses
  FROM ledger
  WHERE branchId = ?
    AND createdAt >= ?
    AND createdAt <= ?
  GROUP BY year
  ORDER BY year ASC
`;