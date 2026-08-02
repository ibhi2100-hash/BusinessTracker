// clientStatementDefinitions.ts
import { UserDefinitions } from "./users/UserDefinitions";
import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { SessionDefinitions } from "./session/SessionDefinition";
import { ExecutionContextDefinitions } from "../repositories/ExecutionContextRepitory/executionDefinition";
import { KnownNodesDefinitions } from "./knownNodes/KnownNodeDefinition";
import { ApplicationStateDefinition } from "./applicationState/applicationStateDefinition";


export const ClientStatementDefinitions: StatementDefinition[] = [

    ...UserDefinitions,
    ...SessionDefinitions,
    ...ExecutionContextDefinitions,
    ...KnownNodesDefinitions,
    ...ApplicationStateDefinition,
];