import type { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { SyncCursorStatementKeys } from "./keys";
import * as SQL from "./sql";

export const SyncCursorStatementsDefinition: StatementDefinition[] = [
    {
        key: SyncCursorStatementKeys.ensure,
        sql: SQL.ENSURE_SYNC_CURSOR,
    },
    {
        key: SyncCursorStatementKeys.get,
        sql: SQL.GET_SYNC_CURSOR,
    },
    {
        key: SyncCursorStatementKeys.advance,
        sql: SQL.ADVANCE_SYNC_CURSOR,
    },
];