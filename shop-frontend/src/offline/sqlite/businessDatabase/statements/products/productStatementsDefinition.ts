import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { productKeys } from "./productStatementKeys";

export const ProductStatementDefinition: StatementDefinition[] = [

    {
        key: productKeys.productUpsert,
        sql: SQL.PRODUCT_UPSERT,
    },

    {
        key: productKeys.findById,
        sql: SQL.FIND_BY_ID,
    },

    {
        key: productKeys.productDelete,
        sql: SQL.PRODUCT_DELETE,
    },

    {
        key: productKeys.productUpdate,
        sql: SQL.PRODUCT_UPSERT,
    },

    {
        key: productKeys.products,
        sql: SQL.PRODUCTS
    }

];