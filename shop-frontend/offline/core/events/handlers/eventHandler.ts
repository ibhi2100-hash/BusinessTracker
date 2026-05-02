import { AppDB } from "@/src/db";
import { BaseEvent } from "../types";
import { InventoryEventType } from "../eventGroups/inventoryEvents";
import { BusinessEventTypes } from "../eventGroups/businessEvents";
import { Business } from "@/types/types";
import { handleBusiness } from "./business/businessHandler";
import { handleSaleCompleted } from "./sales/saleHandler";
import { ProductHandler } from "./products/productCreatedHandler";
import { InventoryHandler } from "./inventory/inventoryHandler";


type EventHandler = (db: AppDB, event: BaseEvent) => Promise<void>;


export const handlers: Record<string, EventHandler[]> = {
   "BUSINESS_CREATED" : [handleBusiness],
   "PRODUCT_CREATED" : [ProductHandler.create],
   "OPENING_INVENTORY_CREATED": [InventoryHandler.openingInventory],
    SALE_COMPLETED: [handleSaleCompleted],

};