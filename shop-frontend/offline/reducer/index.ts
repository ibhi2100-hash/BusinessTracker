import { categoryHandlers } from "./categoryHandlers";
import { productHandlers } from "./productHandlers";
import { inventoryHandlers } from "./inventoryHandlers";
import { salesHandlers } from "../events/reducers/salesHandlers";
import { InventoryEventType } from "../events/eventGroups/inventoryEvents";
import { salesEventType } from "../events/eventGroups/salesEvent";

export async function applyEvent(event: any){
    switch(event.type){
        case InventoryEventType.CATEGORY_ADDED:
            return categoryHandlers.createCategory(event)

        case InventoryEventType.BRAND_ADDED:
            return categoryHandlers.createBrand(event);
        
        case InventoryEventType.PRODUCT_CREATED:
            return productHandlers.createProduct(event);
        
        case salesEventType.SALE_ADDED:
            return salesHandlers.create(event)
    }

}