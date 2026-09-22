import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { syncActivityKeys } from "./syncActivityKeys";

export const SyncActivityStatementDefinition: StatementDefinition[] = [
  { key: syncActivityKeys.insert,             sql: SQL.ACTIVITY_INSERT },
  { key: syncActivityKeys.findById,           sql: SQL.FIND_BY_ID },
  { key: syncActivityKeys.findByActivityId,   sql: SQL.FIND_BY_ACTIVITY_ID },
  { key: syncActivityKeys.findRecent,         sql: SQL.FIND_RECENT },
  { key: syncActivityKeys.findByType,         sql: SQL.FIND_BY_TYPE },
  { key: syncActivityKeys.findByStatus,       sql: SQL.FIND_BY_STATUS },
  { key: syncActivityKeys.findByEvent,        sql: SQL.FIND_BY_EVENT },
  { key: syncActivityKeys.findByAggregate,    sql: SQL.FIND_BY_AGGREGATE },
  { key: syncActivityKeys.findByTypeAndRange, sql: SQL.FIND_BY_TYPE_AND_RANGE },
  { key: syncActivityKeys.findInRange,        sql: SQL.FIND_IN_RANGE },
  { key: syncActivityKeys.findErrors,         sql: SQL.FIND_ERRORS },
  { key: syncActivityKeys.countByType,        sql: SQL.COUNT_BY_TYPE },
  { key: syncActivityKeys.deleteOlderThan,    sql: SQL.DELETE_OLDER_THAN },
  { key: syncActivityKeys.deleteById,         sql: SQL.DELETE_BY_ID },
];