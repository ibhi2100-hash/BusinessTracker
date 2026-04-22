import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/core/db/schema";
export async function LiabilityReducer(tx: IDBTransaction, event: BaseEvent) {


  switch (event.type) {

    case "LIABILITY_ADDED":
        tx.objectStore(TABLES.LIABILITIES).add(event.payload);
        break;

    case "LIABILITY_REPAYMENT":
        const store = tx.objectStore(TABLES.LIABILITIES);
        store.put(event.payload);
        break;

    default: 
        return []
    
  }
  
}