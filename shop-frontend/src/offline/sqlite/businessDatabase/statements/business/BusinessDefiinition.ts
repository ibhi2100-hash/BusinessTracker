import * as SQL from "./sql"
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition"
import { businessKeys } from "./businessKeys"

export const BusinessStatementDefinition: StatementDefinition[] = [
    {
        key: businessKeys.businessUpsert,
        sql: SQL.BUSINESS_UPSERT,
    },

    {
        key: businessKeys.findById,
        sql: SQL.FIND_BY_ID
    },

    {
        key: businessKeys.businessDelete,
        sql: SQL.BUSINESS_DELETE
    },

    {
        key: businessKeys.businesssUpdate,
        sql: SQL.BUSINESS_UPSERT
    },

    {
        key: businessKeys.businessActivation,
        sql: SQL.BUSINESS_ACTIVATION
    },

    {
        key: businessKeys.findAll,
        sql: SQL.FIND_All
    }
]