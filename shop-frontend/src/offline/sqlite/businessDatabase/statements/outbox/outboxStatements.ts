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
    get markSynced(){
        return this.manager.get(OutboxKeys.markSynced)
    }

    get markConflict(){
        return this.manager.get(OutboxKeys.markConflict)
    }

    get markRejected(){
        return this.manager.get(OutboxKeys.markRejected)
    }

    get scheduleRetry(){
        return this.manager.get(OutboxKeys.scheduleRetry)
    }

    get resetInFlight(){
        return this.manager.get(OutboxKeys.resetInFlight)
    }
}