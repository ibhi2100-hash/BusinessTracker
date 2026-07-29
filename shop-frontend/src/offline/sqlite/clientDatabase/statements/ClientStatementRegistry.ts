import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { UserStatements } from "../../clientDatabase/statements/users/UserStatements";
import { SessionStatements } from "./session/SessionStatements";

export class ClientStatementRegistry {
    readonly users: UserStatements;
    readonly session: SessionStatements;

    constructor(
        manager: PreparedStatementManager
    ){
        this.users =
            new UserStatements(manager)
        this.session =
            new SessionStatements(manager)
    }
}