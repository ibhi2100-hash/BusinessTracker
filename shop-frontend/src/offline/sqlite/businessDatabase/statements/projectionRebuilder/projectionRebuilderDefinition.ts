import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { ProjectionResetStatementKeys } from "./projectionRebuilderKeys";

export const projectionResetStatementDefinitions: StatementDefinition[] = [
    {
        key: ProjectionResetStatementKeys.businesses,
        sql: `DELETE FROM businesses`,
    },

    {
        key: ProjectionResetStatementKeys.branches,
        sql: `DELETE FROM branches`,
    },

    {
        key: ProjectionResetStatementKeys.products,
        sql: `DELETE FROM products`,
    },

    {
        key: ProjectionResetStatementKeys.inventories,
        sql: `DELETE FROM inventories`,
    },

    {
        key: ProjectionResetStatementKeys.sales,
        sql: `DELETE FROM sales`,
    },
];