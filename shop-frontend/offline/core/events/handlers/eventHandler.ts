import { AppDB } from "@/src/db";
import { BaseEvent } from "../types";
import { BusinessHandler} from "./business/businessHandler";
import { handleSale } from "./sales/saleHandler";
import { ProductHandler } from "./products/productCreatedHandler";
import { InventoryHandler } from "./inventory/inventoryHandler";


type EventHandler = (db: AppDB, event: BaseEvent) => Promise<void>;


export const handlers: Record<string, EventHandler[]> = {
   "BUSINESS_CREATED" : [BusinessHandler.create],
   "BUSINESS_ACTIVATION": [BusinessHandler.activate],
   "PRODUCT_CREATED" : [ProductHandler.create],
   "PRODUCT_UPDATED" : [ProductHandler.update],
   "PRODUCT_DELETED" : [ProductHandler.delete],
   "OPENING_INVENTORY_CREATED": [InventoryHandler.openingInventory],
   "INVENTORY_ADDED" : [InventoryHandler.openingInventory],
    "SALE_ADDED": [handleSale.singleSale],
    "CHECKOUT_SALE": [handleSale.checkOut]

};