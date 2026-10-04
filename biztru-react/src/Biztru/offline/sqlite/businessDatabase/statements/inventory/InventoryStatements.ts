import type { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { inventoryKeys } from "./inventoryStatementKeys";

export class InventoryStatements {  
    private readonly manager: PreparedStatementManager
    constructor(
        manager: PreparedStatementManager
    ) {
        this.manager = manager
    }

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