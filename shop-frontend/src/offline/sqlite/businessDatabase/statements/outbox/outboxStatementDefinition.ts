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
    }
]