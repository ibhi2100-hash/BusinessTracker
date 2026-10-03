import type {
    PreparedStatementManager
} from "../../../PreparedStatement/PreparedStatementManager";

import {
    currentSessionKeys
} from "./clientSessionKeys";

export class CurrentSessionStatements {
    private readonly managers: PreparedStatementManager;
    constructor(
        managers: PreparedStatementManager
    ) {
        this.managers = managers
    }

    get insert() {
        return this.managers.get(
            currentSessionKeys.insertCurrentSession
        );
    }

    get find() {
        return this.managers.get(
            currentSessionKeys.findCurrentSession
        );
    }

    get update() {
        return this.managers.get(
            currentSessionKeys.updateCurrentSession
        );
    }

    get upsert() {
        return this.managers.get(
            currentSessionKeys.upsertCurrentSession
        );
    }

    get delete() {
        return this.managers.get(
            currentSessionKeys.deleteCurrentSession
        );
    }
}