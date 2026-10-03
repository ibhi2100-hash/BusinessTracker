import type {
    StatementDefinition
} from "../../../PreparedStatement/StatementRegistry/statementDefinition";

import {
    currentSessionKeys
} from "./clientSessionKeys";

import * as SQL from "./sql";

export const CurrentSessionDefinitions: StatementDefinition[] = [
    {
        key: currentSessionKeys.insertCurrentSession,
        sql: SQL.INSERT_CURRENT_SESSION,
    },

    {
        key: currentSessionKeys.findCurrentSession,
        sql: SQL.FIND_CURRENT_SESSION,
    },

    {
        key: currentSessionKeys.updateCurrentSession,
        sql: SQL.UPDATE_CURRENT_SESSION,
    },

    {
        key: currentSessionKeys.upsertCurrentSession,
        sql: SQL.UPSERT_CURRENT_SESSION,
    },

    {
        key: currentSessionKeys.deleteCurrentSession,
        sql: SQL.DELETE_CURRENT_SESSION,
    },
];