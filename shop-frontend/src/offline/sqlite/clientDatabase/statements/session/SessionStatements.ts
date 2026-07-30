import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { sessionKeys } from "./SessionKeys";



export class SessionStatements {

    readonly saveSession: PreparedStatement;
    readonly getCurrentSession: PreparedStatement;
    readonly clearSession: PreparedStatement
    constructor(
        manager: PreparedStatementManager
    ){

        this.saveSession = 
            manager.get(
                sessionKeys.saveSession
            );
        this.getCurrentSession =
            manager.get(
                sessionKeys.getCurrentSession
            );
        
        this.clearSession = 
            manager.get(
                sessionKeys.clearSession
            )

        
    }

}