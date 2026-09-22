import * as SQL from "./sql"
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition"
import { conflictKeys } from "./conflictKeys"

export const ConflictStatementDefinition: StatementDefinition[] = [
    {
        key: conflictKeys.getPendingConflicts,
        sql: SQL.GET_PENDING_CONFLICTS,
    },

    { key: conflictKeys.insert,                sql: SQL.CONFLICT_INSERT },
    { key: conflictKeys.upsert,                sql: SQL.CONFLICT_UPSERT },
    { key: conflictKeys.findById,              sql: SQL.FIND_BY_ID },
    { key: conflictKeys.findByAggregate,       sql: SQL.FIND_BY_AGGREGATE },
    { key: conflictKeys.findByStatus,          sql: SQL.FIND_BY_STATUS },
    { key: conflictKeys.findPending,           sql: SQL.FIND_PENDING },
    { key: conflictKeys.findPendingByAggregate,sql: SQL.FIND_PENDING_BY_AGGREGATE },
    { key: conflictKeys.resolve,               sql: SQL.RESOLVE },
    { key: conflictKeys.updateStatus,          sql: SQL.UPDATE_STATUS },
    { key: conflictKeys.deleteById,            sql: SQL.DELETE_BY_ID },
    { key: conflictKeys.deleteByAggregate,     sql: SQL.DELETE_BY_AGGREGATE },
    { key: conflictKeys.countByStatus,         sql: SQL.COUNT_BY_STATUS },

]
