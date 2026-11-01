
import type { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { EventInboxStatementKeys } from "./key";

export class EventInboxStatements {
    private readonly manager: PreparedStatementManager
    constructor(
        manager: PreparedStatementManager
    ) {
        this.manager = manager
    }

    get insert() {
        return this.manager.get(EventInboxStatementKeys.insert);
    }

    get loadPending() {
        return this.manager.get(EventInboxStatementKeys.claimPending);
    }

    get delete() {
        return this.manager.get(EventInboxStatementKeys.delete);
    }

    get recordFailure() {
        return this.manager.get(EventInboxStatementKeys.recordFailure);
    }

    get count() {
        return this.manager.get(EventInboxStatementKeys.count);
    }

    get allInbox(){
        return this.manager.get(EventInboxStatementKeys.allInbox)
    }

    get recoverStale() {
        return this.manager.get(EventInboxStatementKeys.recoverStale)
    }
}
