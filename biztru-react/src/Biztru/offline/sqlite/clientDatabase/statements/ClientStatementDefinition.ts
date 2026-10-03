// clientStatementDefinitions.ts
import { UserDefinitions } from "./users/UserDefinitions";
import type{ StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { SessionDefinitions } from "./session/SessionDefinition";
import { ExecutionContextDefinitions } from "../repositories/ExecutionContextRepitory/executionDefinition";
import { KnownNodesDefinitions } from "./knownNodes/KnownNodeDefinition";
import { ApplicationStateDefinition } from "./applicationState/applicationStateDefinition";
import { CurrentBusinessDefinitions } from "./currentBusiness/currentBusinessDefinitions";
import { CurrentSessionDefinitions } from "./clientSession/clientSessionDefinition";


export const ClientStatementDefinitions: StatementDefinition[] = [

    ...UserDefinitions,
    ...SessionDefinitions,
    ...ExecutionContextDefinitions,
    ...KnownNodesDefinitions,
    ...ApplicationStateDefinition,
    ...CurrentBusinessDefinitions,
    ...CurrentSessionDefinitions
];