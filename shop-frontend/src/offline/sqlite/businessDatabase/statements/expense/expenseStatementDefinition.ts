// expenseStatementDefinition.ts
import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { expenseKeys } from "./expenseStatementKey";

export const ExpenseStatementDefinition: StatementDefinition[] = [
  { key: expenseKeys.expenseUpsert, sql: SQL.EXPENSE_UPSERT },
  { key: expenseKeys.findById, sql: SQL.FIND_BY_ID },
  { key: expenseKeys.expenseDelete, sql: SQL.EXPENSE_DELETE },
  { key: expenseKeys.expenseUpdate, sql: SQL.EXPENSE_UPDATE },
  { key: expenseKeys.findAll, sql: SQL.FIND_ALL },
  { key: expenseKeys.findByBranch, sql: SQL.FIND_BY_BRANCH },
  { key: expenseKeys.findByCategory, sql: SQL.FIND_BY_CATEGORY },
  { key: expenseKeys.findByGroup, sql: SQL.FIND_BY_GROUP },
  { key: expenseKeys.listExpenses, sql: SQL.LIST_EXPENSES },
  { key: expenseKeys.countExpenses, sql: SQL.COUNT_EXPENSES },
  { key: expenseKeys.summaryByDateRange, sql: SQL.SUMMARY_BY_DATE_RANGE },
  { key: expenseKeys.summaryByCategory, sql: SQL.SUMMARY_BY_CATEGORY },
  { key: expenseKeys.getAllExpenses, sql: SQL.GET_ALL_EXPENSES },
];