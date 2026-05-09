import { AppDB } from "@/src/db";
import { BaseEvent } from "../types";
import { BusinessHandler} from "./business/businessHandler";
import { handleSale } from "./sales/saleHandler";
import { ProductHandler } from "./products/productCreatedHandler";
import { InventoryHandler } from "./inventory/inventoryHandler";
import { BusinessEventTypes } from "../eventGroups/businessEvents";
import { InventoryEventType } from "../eventGroups/inventoryEvents";
import { OpeninigEventType } from "../eventGroups/openingEvents";
import { salesEventType } from "../eventGroups/salesEvent";


type EventHandler = (db: AppDB, event: BaseEvent) => Promise<void>;


export const handlers: Record<string, EventHandler[]> = {
        [BusinessEventTypes.BUSINESS_CREATED]   : [BusinessHandler.createBusiness],
    [BusinessEventTypes.BRANCH_CREATED]         : [BusinessHandler.createBranch],
    [BusinessEventTypes.BUSINESS_ACTIVATION]    : [BusinessHandler.activate],
    [InventoryEventType.PRODUCT_CREATED]        : [ProductHandler.create],
    [InventoryEventType.PRODUCT_UPDATED]        : [ProductHandler.update],
    [InventoryEventType.PRODUCT_DELETED]        : [ProductHandler.delete],
    [OpeninigEventType.OPENING_INVENTORY_CREATED]: [InventoryHandler.openingInventory],
    [InventoryEventType.INVENTORY_ADDED]        : [InventoryHandler.openingInventory],
    [salesEventType.SALE_ADDED]                 : [handleSale.singleSale],
    "CHECKOUT_SALE": [handleSale.checkOut]

};