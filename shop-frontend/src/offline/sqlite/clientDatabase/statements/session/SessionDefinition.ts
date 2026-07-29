import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import  * as SQL from "./sql";
import { sessionKeys } from "./SessionKeys";

export const SessionDefinitions: StatementDefinition[] = [
    {
        key: sessionKeys.saveSession,
        sql: SQL.SAVE_SESSION
    },

    {
        key: sessionKeys.getCurrentSession,
        sql: SQL.GET_CURRENT_SESSION
    },

    {
        key: sessionKeys.clearSession,
        sql: SQL.CLEAR_SESSION
    }
]