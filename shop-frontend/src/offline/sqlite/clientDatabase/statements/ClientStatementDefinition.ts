// clientStatementDefinitions.ts
import { UserDefinitions } from "./users/UserDefinitions";
import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";


export const ClientStatementDefinitions: StatementDefinition[] = [

    ...UserDefinitions,
];