import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { knownNodesKeys } from "./keys";
import * as SQL from "./sql"


export const KnownNodesDefinitions: StatementDefinition[] =  [
    {
        key: knownNodesKeys.FindAll,
        sql: SQL.ALL_BUSINESS
    }
]