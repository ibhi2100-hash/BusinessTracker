import * as SQL from "./sql";

import { StatementDefinition }
  from "../../../PreparedStatement/StatementRegistry/statementDefinition";

import { ledgerKeys }
  from "./ledgerKeys";


export const LedgerStatementDefinition: StatementDefinition[] = [

  {
    key: ledgerKeys.append,
    sql: SQL.LEDGER_APPEND
  },

  {
    key: ledgerKeys.findById,
    sql: SQL.FIND_BY_ID
  },

  {
    key: ledgerKeys.findByEvent,
    sql: SQL.FIND_BY_EVENT
  },

  {
    key: ledgerKeys.findByBusiness,
    sql: SQL.FIND_BY_BUSINESS
  },

  {
    key: ledgerKeys.findByBranch,
    sql: SQL.FIND_BY_BRANCH
  },

  {
    key: ledgerKeys.findByAccount,
    sql: SQL.FIND_BY_ACCOUNT
  },

  {
    key: ledgerKeys.getAccountTotals,
    sql: SQL.GET_ACCOUNT_TOTALS
  },

  {
    key: ledgerKeys.verfifyEvent,
    sql: SQL.VERIFY_EVENT
  }

];