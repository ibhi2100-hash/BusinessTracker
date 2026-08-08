import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { inventoryKeys } from "./inventoryStatementKeys";

export const InventoryStatementDefinition: StatementDefinition[] = [

    {
        key: inventoryKeys.inventoryUpsert,
        sql: SQL.INVENTORY_UPSERT,
    },

    {
        key: inventoryKeys.findById,
        sql: SQL.FIND_BY_ID,
    },

    {
        key: inventoryKeys.inventoryUpdate,
        sql: SQL.INVENTORY_UPSERT,
    }

];