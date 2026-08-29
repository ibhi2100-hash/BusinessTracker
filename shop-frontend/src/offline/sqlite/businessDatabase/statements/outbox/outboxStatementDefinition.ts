import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { OutboxKeys } from "./outBoxKeys";
import * as SQL from "./sql";

export const OutboxStatementsDefinition: StatementDefinition[] = [
    {
        key: OutboxKeys.insert,
        sql: SQL.INSERT_INTO_OUTBOX
    },

    {
        key: OutboxKeys.getPending,
        sql: SQL.GET_PENDING
    },

    {
        key: OutboxKeys.lockBatch,
        sql: SQL.LOCK_BATCH
    },

    {
        key: OutboxKeys.markSynced,
        sql: SQL.MARK_SYNCED
    },

    {
        key: OutboxKeys.markConflict,
        sql: SQL.MARK_CONFLICT
    },

    {
        key: OutboxKeys.markRejected,
        sql: SQL.MARK_REJECTED
    },

    {
        key: OutboxKeys.scheduleRetry,
        sql: SQL.SCHEDULE_RETRY
    },

    {
        key: OutboxKeys.resetInFlight,
        sql: SQL.RESET_IN_FLIGHT
    }
]