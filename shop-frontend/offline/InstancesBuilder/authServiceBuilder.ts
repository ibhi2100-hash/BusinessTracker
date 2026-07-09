import { StorageBusCreator } from "@/src/offline/sqlite/bus/StorageBusCreator";
import { UserStatements } from "@/src/offline/repositories/SQLiteAuthRepository/UserStatements";
import { SQLiteAuthRepository } from "@/src/offline/repositories/SQLiteAuthRepository/SQLiteAuthRepository";
import { SQLiteSessionRepository } from "@/src/offline/repositories/SQLiteSessionRepository/SQLiteSessionRepository";
import { SessionStatements } from "@/src/offline/repositories/SQLiteSessionRepository/SessionStatements";
import { AuthService } from "@/src/services/authService";

export function authServiceBuilder(){
    const storage =
        StorageBusCreator();
    const userStatement = 
        new UserStatements(storage);
    const sessionStatements = 
        new SessionStatements(storage);
      const repository = 
        new SQLiteAuthRepository(
          userStatement
        );
    
      const sessionRepo = 
        new SQLiteSessionRepository(sessionStatements)

      const authService = 
        new AuthService(
            repository,
            sessionRepo
        )

    return authService
}