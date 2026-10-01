export const LEDGER_APPEND = `
  INSERT INTO ledger (
    id,
    eventId,
    businessId,
    branchId,
    type,
    account,
    direction,
    amount,
    entryIndex,
    createdAt
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const FIND_BY_ID = `
  SELECT *
  FROM ledger
  WHERE id = ?
`;

export const FIND_BY_EVENT = `
  SELECT *
  FROM ledger
  WHERE eventId = ?
  ORDER BY entryIndex ASC
`;

export const FIND_BY_BUSINESS = `
  SELECT *
  FROM ledger
  WHERE businessId = ?
  ORDER BY createdAt ASC, entryIndex ASC
`;

export const FIND_BY_BRANCH = `
  SELECT *
  FROM ledger
  WHERE branchId = ?
  ORDER BY createdAt ASC, entryIndex ASC
`;

export const FIND_BY_ACCOUNT = `
  SELECT *
  FROM ledger
  WHERE account = ?
  ORDER BY createdAt ASC, entryIndex ASC
`; 

export const GET_ACCOUNT_BALANCE = `
  SELECT
    COALESCE(
      SUM(
        CASE
          WHEN direction = 'DEBIT' THEN amount
          WHEN direction = 'CREDIT' THEN -amount
          ELSE 0
        END
      ),
      0
    ) AS balance
  FROM ledger
  WHERE businessId = ?
    AND account = ?
`;

export const GET_ACCOUNT_TOTALS = `
  SELECT
    COALESCE(
      SUM(
        CASE
          WHEN direction = 'DEBIT' THEN amount
          ELSE 0
        END
      ),
      0
    ) AS totalDebits,

    COALESCE(
      SUM(
        CASE
          WHEN direction = 'CREDIT' THEN amount
          ELSE 0
        END
      ),
      0
    ) AS totalCredits

  FROM ledger
  WHERE businessId = ?
    AND account = ?
`;

export const VERIFY_EVENT = `
  SELECT
    COALESCE(
      SUM(
        CASE
          WHEN direction = 'DEBIT'
            THEN amount
          ELSE 0
        END
      ),
      0
    ) AS totalDebits,

    COALESCE(
      SUM(
        CASE
          WHEN direction = 'CREDIT'
            THEN amount
          ELSE 0
        END
      ),
      0
    ) AS totalCredits

  FROM ledger

  WHERE eventId = ?
`;

export const GET_DASHBOARD = `
  SELECT
    COALESCE(SUM(
        CASE
            WHEN account = 'REVENUE'
             AND direction = 'CREDIT'
            THEN amount
            ELSE 0
        END
    ), 0) AS revenue,

    COALESCE(SUM(
        CASE
            WHEN account = 'COGS'
             AND direction = 'DEBIT'
            THEN amount
            ELSE 0
        END
    ), 0) AS expenses,

    COALESCE(SUM(
        CASE
            WHEN account = 'CASH'
             AND direction = 'DEBIT'
            THEN amount
            WHEN account = 'CASH'
             AND direction = 'CREDIT'
            THEN -amount
            ELSE 0
        END
    ), 0) AS cashAtHand

FROM ledger
WHERE branchId = ?;
`