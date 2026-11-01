
import type { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { EventInboxStatementKeys } from "./key";
import * as SQL from "./sql";

export const EventInboxStatementsDefinition: StatementDefinition[] = [
    {
        key: EventInboxStatementKeys.insert,
        sql: SQL.INSERT_INBOX_EVENT
    },
    {
        key: EventInboxStatementKeys.delete,
        sql: SQL.DELETE_INBOX_EVENT
    },
    {
        key: EventInboxStatementKeys.recordFailure,
        sql: SQL.UPDATE_INBOX_FAILURE
    },
    {
        key: EventInboxStatementKeys.count,
        sql: SQL.COUNT_PENDING_INBOX_EVENTS
    },
    {
        key: EventInboxStatementKeys.allInbox,
        sql: SQL.FIND_ALL_INBOX
    },
    {
        key: EventInboxStatementKeys.claimPending,
        sql: SQL.CLAIM_PENDING_INBOX_EVENTS,
    },

    {
        key: EventInboxStatementKeys.recoverStale,
        sql: SQL.RECOVER_STALE_INBOX_EVENTS
    }
];
