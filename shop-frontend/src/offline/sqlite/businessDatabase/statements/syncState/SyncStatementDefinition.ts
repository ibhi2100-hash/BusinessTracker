import * as SQL from  "./sql"
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { syncStateKeys } from "./syncStateKeys";

export const SyncStateStatementDefinition: StatementDefinition[] = [
  { key: syncStateKeys.upsert,            sql: SQL.SYNC_STATE_UPSERT },
  { key: syncStateKeys.find,              sql: SQL.FIND },
  { key: syncStateKeys.updateStatus,      sql: SQL.UPDATE_STATUS },
  { key: syncStateKeys.updateAfterSync,   sql: SQL.UPDATE_AFTER_SYNC },
  { key: syncStateKeys.incrementCounters, sql: SQL.INCREMENT_COUNTERS },
  { key: syncStateKeys.resetCounters,     sql: SQL.RESET_COUNTERS },
  { key: syncStateKeys.setDeviceCursor,   sql: SQL.SET_DEVICE_CURSOR },
  { key: syncStateKeys.setError,          sql: SQL.SET_ERROR },
  { key: syncStateKeys.clearError,        sql: SQL.CLEAR_ERROR },
];