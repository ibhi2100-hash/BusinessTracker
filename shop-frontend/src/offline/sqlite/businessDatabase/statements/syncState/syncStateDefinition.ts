import * as SQL
    from "./sql";

import {
    StatementDefinition
} from "../../../PreparedStatement/StatementRegistry/statementDefinition";

import {
    syncStateKeys
} from "./syncStateKeys";


export const SyncStateStatementDefinition:
    StatementDefinition[] = [

    {
        key:
            syncStateKeys.getCursor,

        sql:
            SQL.GET_CURSOR
    },

    {
        key:
            syncStateKeys.setCursor,

        sql:
            SQL.SET_CURSOR
    },

    {
        key:
            syncStateKeys.advanceCursor,

        sql:
            SQL.ADVANCE_CURSOR
    }

];