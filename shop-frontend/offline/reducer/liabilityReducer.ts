import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/db/schema";
export function LiabilityReducer(tx: IDBTransaction, event: BaseEvent) {


  switch (event.type) {

    case "LIABILITY_ADDED":
        tx.objectStore(TABLES.ASSETS).add(event.payload);
        break;

    case "LIABILITY_REPAYMENT":
        const store = tx.objectStore(TABLES.BUSINESS);
        store.put(event.payload);
        break;

    default: 
        return []
    
  }
  
}