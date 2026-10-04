import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { productKeys } from "./productStatementKeys";

export class ProductStatements {
    private readonly manager: PreparedStatementManager;

    constructor(
        manager: PreparedStatementManager
    ) {
        this.manager = manager
    }

    get upsert() {
        return this.manager.get(
            productKeys.productUpsert
        );
    }

    get findById() {
        return this.manager.get(
            productKeys.findById
        );
    }

    get delete() {
        return this.manager.get(
            productKeys.productDelete
        );
    }

    get update() {
        return this.manager.get(
            productKeys.productUpdate
        );
    }

    get products(){
        return this.manager.get(
            productKeys.products
        )
    }


}