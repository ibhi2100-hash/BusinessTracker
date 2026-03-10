import { openDB } from "idb";
import { DB_NAME } from "./schema";
import { DB_VERSION } from "./schema";
import { TABLES } from "./schema";

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        

        /*
            EVENTS TABLE
            Stores all offline actions
        */
       const eventStore = db.createObjectStore(TABLES.EVENTS, {
        keyPath: "id"
       })

       eventStore.createIndex("by_synced", "synced")
       eventStore.createIndex("by_type", "type")
       eventStore.createIndex("by_timestamp", "timestamp")



       /* 
            LEDGER TABLE
            Financials entries
        */
       const ledgerStore = db.createObjectStore(TABLES.LEDGER_ENTRIES, {
        keyPath: "id"
       })

       ledgerStore.createIndex("by_account", "account")
       ledgerStore.createIndex("by_event", "eventId")
       ledgerStore.createIndex("by_timestamp", "timestamp")


       /*
            INVENTORY TABLE
        */
       const inventoryStore = db.createObjectStore(TABLES.INVENTORY, {
        keyPath: "id"
       })

       inventoryStore.createIndex("by_product", "productId")

       /*
            SALES TABLE
        */
       const saleStore = db.createObjectStore(TABLES.SALES, {
        keyPath: "id"
       })

       saleStore.createIndex("by_date", "date")

       /*
            ASSETS TABLE
        */
        const assetsStore = db.createObjectStore(TABLES.ASSETS, {
            keyPath: "id"
        })

        /*
            LIABILITY TABLE
        */
        const liabilityStore = db.createObjectStore(TABLES.LIABILITIES, {
            keyPath: "id"
        })

        /*
            SNAPSHOT TABLE
            Fast dashboard startup
        */
       db.createObjectStore(TABLES.SNAPSHOT, {
        keyPath: "id"
       })

       /*
            SYNC META TABLE
            Sync tracking
        */
        db.createObjectStore(TABLES.SYNC_META, {
            keyPath: "id"
        })
    }
})