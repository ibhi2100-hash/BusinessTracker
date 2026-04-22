import { eventBus } from "../core/eventBus/eventBus";
import { useInventoryStore } from "@/store/inventoryStore";
import { InventoryEventType } from "../core/events/eventGroups/inventoryEvents";

let unsubscribe: (() => void) | null = null;

export const startInventorySubscriber = ()=> {
    if(unsubscribe) return; // prevent duplicate

    unsubscribe = eventBus.subscribe((event)=> {
        const store = useInventoryStore.getState();

        switch(event.type) {
            case InventoryEventType.PRODUCT_CREATED:
                store.addProduct(event.payload);
                break;
            case InventoryEventType.PRODUCT_UPDATED:
                store.updateProduct(event.payload);
                break;
        }
    });
};

export const stopInventorySubscriber = () => {
    if(unsubscribe){
        unsubscribe();
        unsubscribe = null;
    }
};