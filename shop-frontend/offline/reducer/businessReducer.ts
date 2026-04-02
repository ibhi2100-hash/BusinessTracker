import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/db/schema";
export function BusinessReducer(tx: IDBTransaction, event: BaseEvent) {


  switch (event.type) {

    case "BUSINESS_CREATED":
        tx.objectStore(TABLES.BUSINESS).put(event.payload.business);
        tx.objectStore(TABLES.BRANCHES).put(event.payload.branch);
        break;

    case "BUSINESS_ACTIVATION":
        const store = tx.objectStore(TABLES.BUSINESS);
        store.put({
            ...event.payload, // or fetch inside reducer if needed
            isOnboarding: false,
            onboardingCompleted: true,
            status: "ACTIVE",
        });
        break;

    default: 
        return []
    
  }
  
}
  