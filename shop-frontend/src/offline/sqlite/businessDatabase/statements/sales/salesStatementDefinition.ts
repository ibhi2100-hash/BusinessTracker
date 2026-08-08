import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { salesKeys } from "./salesStatementKeys";

export const SalesStatementDefinition: StatementDefinition[] = [

    {
        key: salesKeys.salesUpsert,
        sql: SQL.SALES_UPSERT
    },

    {
        key: salesKeys.findById,
        sql: SQL.FIND_BY_ID
    },


    {
        key: salesKeys.salesUpdate,
        sql: SQL.SALES_UPSERT
    }

];