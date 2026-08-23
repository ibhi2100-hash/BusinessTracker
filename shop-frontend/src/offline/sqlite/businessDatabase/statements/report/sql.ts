// statements/report/sql.ts

/** Balances (point-in-time) + period P&L */
export const REPORT_PERIOD_SUMMARY = `
  WITH balances AS (
    SELECT
      account,
      SUM(CASE WHEN direction = 'DEBIT' THEN amount ELSE -amount END) AS balance
    FROM ledger
    WHERE branchId = ?
      AND account IN (
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

/** Single metric helpers */
export const REPORT_PERIOD_REVENUE = `
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM ledger
  WHERE branchId = ?
    AND account = 'REVENUE'
    AND direction = 'CREDIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;

export const REPORT_PERIOD_COGS = `
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM ledger
  WHERE branchId = ?
    AND account = 'COGS'
    AND direction = 'DEBIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;

export const REPORT_PERIOD_EXPENSES = `
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM ledger
  WHERE branchId = ?
    AND account = 'EXPENSE'
    AND direction = 'DEBIT'
    AND createdAt >= ?
    AND createdAt <= ?
`;

/** Today from sales projection (optional parallel source) */
export const REPORT_TODAY_SALES = `
  SELECT COALESCE(SUM(total), 0) AS value
  FROM sales
  WHERE branchId = ?
    AND status = 'completed'
    AND createdAt >= ?
    AND createdAt <= ?
`;

export const REPORT_TODAY_PROFIT = `
  SELECT COALESCE(SUM(profit), 0) AS value
  FROM sales
  WHERE branchId = ?
    AND status = 'completed'
    AND createdAt >= ?
    AND createdAt <= ?
`;

/** Point-in-time balances only */
export const REPORT_BALANCES = `
  SELECT
    account,
    SUM(CASE WHEN direction = 'DEBIT' THEN amount ELSE -amount END) AS balance
  FROM ledger
  WHERE branchId = ?
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