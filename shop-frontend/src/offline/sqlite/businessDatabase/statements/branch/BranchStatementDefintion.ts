import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { BranchStatementKeys } from "./BranchStatementKeys";
import * as SQL from "./sql"
export const BranchStatementDefinition: StatementDefinition[] = [
    {
        key: BranchStatementKeys.insert,
        sql: SQL.insert
    },

    {
        key: BranchStatementKeys.findAll,
        sql: SQL.findAll
    },

    {
        key: BranchStatementKeys.findById,
        sql: SQL.findById
    }
]