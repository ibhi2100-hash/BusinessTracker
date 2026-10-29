
import type { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { EventInboxStatementKeys } from "./key";
import * as SQL from "./sql";

export const EventInboxStatementsDefinition: StatementDefinition[] = [
    {
        key: EventInboxStatementKeys.insert,
        sql: SQL.INSERT_INBOX_EVENT
    },
    {
        key: EventInboxStatementKeys.exists,
        sql: SQL.EXISTS_INBOX_EVENT
    },
    {
        key: EventInboxStatementKeys.loadPending,
        sql: SQL.LOAD_PENDING_INBOX_EVENTS
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
        sql: SQL.COUNT_INBOX_EVENTS
    }
];
