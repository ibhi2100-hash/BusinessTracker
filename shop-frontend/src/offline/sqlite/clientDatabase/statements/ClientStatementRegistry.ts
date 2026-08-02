import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { UserStatements } from "../../clientDatabase/statements/users/UserStatements";
import { ExecutionContextStatements } from "../repositories/ExecutionContextRepitory/ExecutionPreparedStatements";
import { KnownNodesStatements } from "./knownNodes/KnownNodesStatements";
import { SessionStatements } from "./session/SessionStatements";

export class ClientStatementRegistry {
    readonly users: UserStatements;
    readonly session: SessionStatements;
    readonly executionContext: ExecutionContextStatements;
    readonly knownNodes: KnownNodesStatements;
    readonly applicationState: ApplicationState

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
    }
}