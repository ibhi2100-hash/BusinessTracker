
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

    get exists() {
        return this.manager.get(EventInboxStatementKeys.exists);
    }

    get loadPending() {
        return this.manager.get(EventInboxStatementKeys.loadPending);
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
}
