import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { salesKeys } from "./salesStatementKeys";

export class SalesStatement {

    constructor(
        private readonly manager: PreparedStatementManager
    ) {}

    get upsert() {
        return this.manager.get(
            salesKeys.salesUpsert
        );
    }

    get findById() {
        return this.manager.get(
            salesKeys.findById
        );
    }

    get delete() {
        return this.manager.get(
            salesKeys.salesDelete
        );
    }

    get update() {
        return this.manager.get(
            salesKeys.salesUpdate
        );
    }

}