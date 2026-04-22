import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/core/db/schema";
export function BusinessReducer(tx: IDBTransaction, event: BaseEvent) {


  switch (event.type) {

    case "BUSINESS_CREATED":
       tx.objectStore(TABLES.BUSINESS).add(event.payload.business);
       tx.objectStore(TABLES.BRANCHES).add(event.payload.branch);
        break;

    case "BUSINESS_ACTIVATION":
        const store = tx.objectStore(TABLES.BUSINESS);
        store.put(event.payload);
        break;

    default: 
        return []
    
  }
  
}
  