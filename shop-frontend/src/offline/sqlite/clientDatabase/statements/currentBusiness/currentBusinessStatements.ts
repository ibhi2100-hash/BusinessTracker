import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { currentBusinessKeys } from "./key";

export class CurrentBusinessStatements {
    constructor(
        private readonly managers: PreparedStatementManager
    ) {}

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