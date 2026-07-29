import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { sessionKeys } from "./SessionKeys";



export class SessionStatements {

    private saveSession: PreparedStatement;
    private getCurrentSession: PreparedStatement;
    private clearSession: PreparedStatement
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