import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import * as SQL from "./sql";
import { UserStatementKeys as Keys } from "./keys";
export const UserDefinitions: StatementDefinition[] = [

    {
        key: Keys.insert,
        sql: SQL.INSERT_USER
    },

    {
        key: Keys.findById,
        sql: SQL.FIND_BY_ID
    },

    {
        key: Keys.update,
        sql: SQL.UPDATE_USER
    },

    {
        key: Keys.delete,
        sql: SQL.DELETE_USER
    }

];