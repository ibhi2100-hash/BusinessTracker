import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition"
import { currentBusinessKeys } from "./key"
import * as SQL from "./sql"
export const CurrentBusinessDefinitions: StatementDefinition[] = [
    {
        key: currentBusinessKeys.insertCurrentBusiness,
        sql: SQL.INSERT_CURRENT_BUSINESS
    },

    {
        key: currentBusinessKeys.findCurrentBusiness,
        sql: SQL.FIND_CURRENT_BUSINESS
    },

    {
        key: currentBusinessKeys.updateCurrentBusiness,
        sql: SQL.UPDATE_CURRENT_BUSINESS
    }
]