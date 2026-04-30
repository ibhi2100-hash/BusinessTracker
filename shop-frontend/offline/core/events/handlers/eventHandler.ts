import { AppDB } from "@/src/db";
import { BaseEvent } from "../types";
import { InventoryEventType } from "../eventGroups/inventoryEvents";
import { BusinessEventTypes } from "../eventGroups/businessEvents";
import { Business } from "@/types/types";
import { handleBusiness } from "./businessHandler";
import { handleSaleCompleted } from "./saleHandler";

type EventHandler = (db: AppDB, event: BaseEvent) => Promise<void>;
const inventory = InventoryEventType;
const business = BusinessEventTypes;
const businessCreated = business.BUSINESS_CREATED
const productCreated = inventory.PRODUCT_CREATED

export const handlers: Record<string, EventHandler[]> = {

    businessCreated: [handleBusiness],
    productCreated : [handleProductCreated],
    SALE_COMPLETED: [handleSaleCompleted],
};