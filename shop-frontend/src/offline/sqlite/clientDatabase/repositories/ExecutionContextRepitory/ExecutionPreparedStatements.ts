import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { ExecutionContextKeys } from "./Keys";

export class ExecutionContextStatements {
    readonly current: PreparedStatement;
    constructor(
        manager: PreparedStatementManager
    ){
        this.current = 
            manager.get(
                ExecutionContextKeys.curentContext
            )
    }
}