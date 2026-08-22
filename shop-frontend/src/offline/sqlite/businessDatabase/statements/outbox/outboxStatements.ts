import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { OutboxKeys } from "./outBoxKeys";

export class OutboxStatments {
    constructor(
        private readonly manager: PreparedStatementManager
    ){};


    get insert(){
        return this.manager.get(OutboxKeys.insert)
    }

    get pendingEvents(){
        return this.manager.get(OutboxKeys.getPending)
    }
}