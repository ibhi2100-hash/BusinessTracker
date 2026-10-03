import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { currentBusinessKeys } from "./key";

export class CurrentBusinessStatements {
    private readonly managers: PreparedStatementManager;
    constructor(
        managers: PreparedStatementManager
    ) {
        this.managers = managers;
    }

    get insert() {
        return this.managers.get(
            currentBusinessKeys.insertCurrentBusiness
        );
    }

    get find() {
        return this.managers.get(
            currentBusinessKeys.findCurrentBusiness
        );
    }

    get update() {
        return this.managers.get(
            currentBusinessKeys.updateCurrentBusiness
        );
    }
}