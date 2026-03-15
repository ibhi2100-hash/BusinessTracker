import { openDB } from "idb";
import { DB_NAME } from "./schema";
import { DB_VERSION } from "./schema";
import { TABLES } from "./schema";

let dbPromise: any = null;

export const getDb = async () => {
    if (typeof window === "undefined") return null;

    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                

        /*
            SESSION TABLE
        */
       const sessionStore = db.createObjectStore(TABLES.SESSION, {
        keyPath: "id"
       })
       /*
            USER TABLE
        */
       const userStore = db.createObjectStore(TABLES.USER, {
        keyPath: "id"
       })

       /* 
            BUSINESS TABLE
        */

        const businessStore = db.createObjectStore(TABLES.BUSINESS, {
            keyPath: "id"
        })

        /* 
            BRANCHES
        */
        const branchesStore = db.createObjectStore(TABLES.BRANCHES, {
            keyPath: "id"
            
        })
        branchesStore.createIndex("businessId", "businessId")
        /*
            EVENTS TABLE
            Stores all offline actions
        */
       const eventStore = db.createObjectStore(TABLES.EVENTS, {
        keyPath: "id"
       })
       eventStore.createIndex("status", "status")
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
       ledgerStore.createIndex("by_branch", "branchId")


       /*
            INVENTORY TABLE
        */
       const inventoryStore = db.createObjectStore(TABLES.INVENTORY, {
        keyPath: "id"
       })

       inventoryStore.createIndex("by_product", "productId")
       inventoryStore.createIndex("by_branch", "branchId")

       /*
            SALES TABLE
        */
       const saleStore = db.createObjectStore(TABLES.SALES, {
        keyPath: "id"
       })

        saleStore.createIndex("by_date", "date")
        saleStore.createIndex("by_business", "businessId")
        saleStore.createIndex("by_branch", "branchId")
        saleStore.createIndex("by_product", "productId")

       /*
            ASSETS TABLE
        */
        const assetsStore = db.createObjectStore(TABLES.ASSETS, {
            keyPath: "id" 
        })
        assetsStore.createIndex("by_business", "businessId")
        assetsStore.createIndex("by_branch", "branchId")

        /*
            LIABILITY TABLE
        */
        const liabilityStore = db.createObjectStore(TABLES.LIABILITIES, {
            keyPath: "id"
        })
        liabilityStore.createIndex("by_business", "businessId")
        liabilityStore.createIndex("by_branch", "branchId")

        /*
            EXPENSE TABLE
        */
        const expenseStore = db.createObjectStore(TABLES.EXPENSES, {
            keyPath: "id"
        })
        expenseStore.createIndex("by_business", "businessId")
        expenseStore.createIndex("by_branch", "branchId")

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

        /*
            Business Data Store
        */
       const BusinessDataStore = db.createObjectStore(TABLES.BUSINESSDATA , {
        keyPath: "id"
       })

         /*
            ProductStore
        */
       const inventoryProducts = db.createObjectStore(TABLES.INVENTORYSTORE, {
        keyPath: "id"
       })


       /*
            ProductStore
        */
       const productStore = db.createObjectStore(TABLES.PRODUCTS, {
        keyPath: "id"
       })

       productStore.createIndex("by_brandId", "brandId");
       productStore.createIndex("by_categoryId", "categoryId")
       productStore.createIndex("by_businessId", "businessId")
       productStore.createIndex("by_branchId", "branchId")


       /*
            CategoryStore
        */
       const categoryStore = db.createObjectStore(TABLES.CATEGORIES, {
        keyPath: "id"
       });
       categoryStore.createIndex("by_name", "name")
       categoryStore.createIndex("by_businessId", "businessId")

       /*
            BrandStore
        */
       const brandStore = db.createObjectStore(TABLES.BRANDS, {
        keyPath: "id"
       })
       brandStore.createIndex("by_categoryId", "categoryId")
       brandStore.createIndex("by_businessId", "businessId")
    },
    blocked(){
        console.warn("DB upgrade blocked. Close other tabs with the app open.")
    },

    blocking(){
        console.warn("A new version of the app is available. Please refresh the page.") 
    },
    terminated(){
        console.warn("Database connection terminated unexpectedly.")
    }
        })
    }

    return dbPromise;
}