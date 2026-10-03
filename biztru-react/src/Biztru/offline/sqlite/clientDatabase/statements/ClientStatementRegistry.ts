import type{ PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { UserStatements } from "../../clientDatabase/statements/users/UserStatements";
import { ExecutionContextStatements } from "../repositories/ExecutionContextRepitory/ExecutionPreparedStatements";
import { KnownNodesStatements } from "./knownNodes/KnownNodesStatements";
import { SessionStatements } from "./session/SessionStatements";
import { ApplicationStateStatements } from "./applicationState/applicationStateStatements";
import { CurrentBusinessStatements } from "./currentBusiness/currentBusinessStatements";
import  { CurrentSessionStatements } from "./clientSession/clientSessionStatements";

export class ClientStatementRegistry {
    readonly users: UserStatements;
    readonly session: SessionStatements;
    readonly executionContext: ExecutionContextStatements;
    readonly knownNodes: KnownNodesStatements;
    readonly applicationState: ApplicationStateStatements;
    readonly currentBusiness: CurrentBusinessStatements;
    readonly currentSession: CurrentSessionStatements;

    constructor(
        manager: PreparedStatementManager
    ){
        this.users =
            new UserStatements(manager)
        this.session =
            new SessionStatements(manager);

        this.executionContext =
            new ExecutionContextStatements(manager)

        this.knownNodes= 
            new KnownNodesStatements(manager)

        this.applicationState  =
            new ApplicationStateStatements(manager)

        this.currentBusiness = 
            new CurrentBusinessStatements(manager);

        this.currentSession = 
            new CurrentSessionStatements(manager);
    }
}