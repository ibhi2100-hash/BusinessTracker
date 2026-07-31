import { ClientStatementRegistry } from "../statements/ClientStatementRegistry";
import { ExecutionContextRepository } from "./ExecutionContextRepitory/ExecutionContextRepository";
import { SQLiteKnownNodeRepository } from "./KnownNodes/SQLiteKnownNodeRepository";
import { SQLiteAuthRepository } from "./SQLiteAuthRepository/SQLiteAuthRepository";
import { SQLiteSessionRepository } from "./SQLiteSessionRepository/SQLiteSessionRepository";
export class ClientRepositoryRegistry {
    readonly users: SQLiteAuthRepository;
    readonly session: SQLiteSessionRepository;
    readonly executionContext: ExecutionContextRepository;
    readonly knownNode: SQLiteKnownNodeRepository;

    

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

        this.executionContext = 
            new ExecutionContextRepository(
                statements.executionContext
            )

        this.knownNode = 
            new SQLiteKnownNodeRepository(
                statements.knownNodes
            )
        
    }
}