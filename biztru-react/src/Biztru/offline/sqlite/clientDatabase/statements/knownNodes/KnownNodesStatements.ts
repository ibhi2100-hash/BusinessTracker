import type{ PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { knownNodesKeys } from "./keys";

export class KnownNodesStatements {
    readonly findall: PreparedStatement

    constructor(
        manager: PreparedStatementManager
    ){
        this.findall = 
            manager.get(
                knownNodesKeys.FindAll
            )
    }
}