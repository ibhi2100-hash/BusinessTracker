// ============================================================
// salesStatementDefinition.ts
// ============================================================
import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { salesKeys } from "./salesStatementKeys";

export const SalesStatementDefinition: StatementDefinition[] = [
  {
    key: salesKeys.salesUpsert,
    sql: SQL.SALES_UPSERT,
  },
  {
    key: salesKeys.findById,
    sql: SQL.FIND_BY_ID,
  },
  {
    key: salesKeys.salesDelete,
    sql: SQL.SALES_DELETE,
  },
  {
    key: salesKeys.salesUpdate,
    sql: SQL.SALES_UPDATE,
  },
  {
    key: salesKeys.findAll,
    sql: SQL.FIND_ALL,
  },
  {
    key: salesKeys.findByBranch,
    sql: SQL.FIND_BY_BRANCH,
  },
  {
    key: salesKeys.findByProduct,
    sql: SQL.FIND_BY_PRODUCT,
  },
  {
    key: salesKeys.findByDateRange,
    sql: SQL.FIND_BY_DATE_RANGE,
  },
  {
    key: salesKeys.findByGroup,
    sql: SQL.FIND_BY_GROUP,
  },
  {
    key: salesKeys.summaryByDateRange,
    sql: SQL.SUMMARY_BY_DATE_RANGE,
  },
  {
    key: salesKeys.getAllSales,
    sql: SQL.GET_ALL_SALES
  }
];