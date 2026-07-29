import { ClientStatementRegistry } from "../statements/ClientStatementRegistry";
import { SQLiteAuthRepository } from "./SQLiteAuthRepository/SQLiteAuthRepository";
import { SQLiteSessionRepository } from "./SQLiteSessionRepository/SQLiteSessionRepository";
export class ClientRepositoryRegistry {
    readonly users: SQLiteAuthRepository;
    readonly session: SQLiteSessionRepository;

    

    constructor(
        statements: ClientStatementRegistry
    ){
        this.users = 
            new SQLiteAuthRepository(
                statements.users
            );

        this.session =
            new SQLiteSessionRepository(
                statements.session
            )
        
    }
}