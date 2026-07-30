import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { UserStatements } from "../../clientDatabase/statements/users/UserStatements";
import { ExecutionContextStatements } from "../repositories/ExecutionContextRepitory/ExecutionPreparedStatements";
import { SessionStatements } from "./session/SessionStatements";

export class ClientStatementRegistry {
    readonly users: UserStatements;
    readonly session: SessionStatements;
    readonly executionContext: ExecutionContextStatements;

    constructor(
        manager: PreparedStatementManager
    ){
        this.users =
            new UserStatements(manager)
        this.session =
            new SessionStatements(manager);

        this.executionContext =
            new ExecutionContextStatements(manager)
    }
}