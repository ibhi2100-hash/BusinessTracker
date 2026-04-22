import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/core/db/schema";
export function AssetsReducer(tx: IDBTransaction, event: BaseEvent) {
    console.log("the event-type that hit the reducer", event.type)

  switch (event.type) {
  

    case "ASSET_ADDED":
        tx.objectStore(TABLES.ASSETS).add(event.payload);
        break;

    case "ASSET_DISPOSED":
        const store = tx.objectStore(TABLES.BUSINESS);
        store.put(event.payload);
        break;

    default: 
        return []
    
  }
  
}