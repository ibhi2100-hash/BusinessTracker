import type { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { SyncCursorStatementKeys } from "./keys";

export class SyncCursorStatements {
    private readonly manager: PreparedStatementManager;

    constructor(manager: PreparedStatementManager) {
        this.manager = manager;
    }

    get ensure() {
        return this.manager.get(
            SyncCursorStatementKeys.ensure
        );
    }

    get get() {
        return this.manager.get(
            SyncCursorStatementKeys.get
        );
    }

    get advance() {
        return this.manager.get(
            SyncCursorStatementKeys.advance
        );
    }
}