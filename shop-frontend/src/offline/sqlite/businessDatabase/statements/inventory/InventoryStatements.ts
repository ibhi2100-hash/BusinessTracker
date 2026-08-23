import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { inventoryKeys } from "./inventoryStatementKeys";

export class InventoryStatements {

    constructor(
        private readonly manager: PreparedStatementManager
    ) {}

    get upsert() {
        return this.manager.get(
            inventoryKeys.inventoryUpsert
        );
    }

    get findById() {
        return this.manager.get(
            inventoryKeys.findById
        );
    }

    get findByProductId(){
        return this.manager.get(inventoryKeys.findByProductId)
    }

    get delete() {
        return this.manager.get(
            inventoryKeys.inventoryDelete
        );
    }

    get update() {
        return this.manager.get(
            inventoryKeys.inventoryUpdate
        );
    }

}