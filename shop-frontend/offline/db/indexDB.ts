import { openDB } from "idb";
import { getDbName, DB_VERSION, TABLES } from "./schema";

const dbCache: Record<string, any> = {};

export const getDb = async (userId?: string) => {
  if (typeof window === "undefined") return null;

  const dbName = getDbName(userId)

  if (!dbCache[dbName]) {
    dbCache[dbName] = openDB(dbName, DB_VERSION, {
      upgrade(db, oldVersion, tx) {

        // ---------------------------
        // HELPER
        // ---------------------------
        function getStore(name: string) {
          if (!db.objectStoreNames.contains(name)) {
            return db.createObjectStore(name, { keyPath: "id" });
          }
          return tx.objectStore(name);
        }

        // ---------------------------
        // EVENTS
        // ---------------------------
        const eventStore = getStore(TABLES.EVENTS);

        if (!eventStore.indexNames.contains("by_status")) {
          eventStore.createIndex("by_status", "status");
        }

        if (!eventStore.indexNames.contains("by_synced")) {
          eventStore.createIndex("by_synced", "synced");
        }

        if (!eventStore.indexNames.contains("by_type")) {
          eventStore.createIndex("by_type", "type");
        }

        if (!eventStore.indexNames.contains("by_createdAt")) {
          eventStore.createIndex("by_createdAt", "createdAt");
        }

        if (!eventStore.indexNames.contains("by_business_branch")) {
          eventStore.createIndex(
            "by_business_branch",
            ["businessId", "branchId"]
          );
        }

        // ---------------------------
        // INVENTORY
        // ---------------------------
        const inventoryStore = getStore(TABLES.INVENTORY);

        if (!inventoryStore.indexNames.contains("by_product_branch")) {
          inventoryStore.createIndex(
            "by_product_branch",
            ["productId", "branchId"],
            { unique: true }
          );
        }

        if (!inventoryStore.indexNames.contains("by_product")) {
          inventoryStore.createIndex("by_product", "productId");
        }

        if (!inventoryStore.indexNames.contains("by_branch")) {
          inventoryStore.createIndex("by_branch", "branchId");
        }

        // ---------------------------
        // PRODUCTS
        // ---------------------------
        const productStore = getStore(TABLES.PRODUCTS);

        if (!productStore.indexNames.contains("by_brand")) {
          productStore.createIndex("by_brand", "brandId");
        }

        if (!productStore.indexNames.contains("by_category")) {
          productStore.createIndex("by_category", "categoryId");
        }

        if (!productStore.indexNames.contains("by_business_branch")) {
          productStore.createIndex(
            "by_business_branch",
            ["businessId", "branchId"]
          );
        }

        // ---------------------------
        // LEDGER
        // ---------------------------
        const ledgerStore = getStore(TABLES.LEDGER_ENTRIES);

        if (!ledgerStore.indexNames.contains("by_event")) {
          ledgerStore.createIndex("by_event", "eventId");
        }

        if (!ledgerStore.indexNames.contains("by_branch")) {
          ledgerStore.createIndex("by_branch", "branchId");
        }

        if (!ledgerStore.indexNames.contains("by_account")) {
          ledgerStore.createIndex("by_account", "account");
        }

        if (!ledgerStore.indexNames.contains("by_business_branch")) {
          ledgerStore.createIndex(
            "by_business_branch",
            ["businessId", "branchId"]
          );
        }

        // ---------------------------
        // CATEGORIES
        // ---------------------------
        const categoryStore = getStore(TABLES.CATEGORIES);

        if (!categoryStore.indexNames.contains("by_business")) {
          categoryStore.createIndex("by_business", "businessId");
        }

        if (!categoryStore.indexNames.contains("by_name_business")) {
          categoryStore.createIndex(
            "by_name_business",
            ["name", "businessId"]
          );
        }

        // ---------------------------
        // BRANDS
        // ---------------------------
        const brandStore = getStore(TABLES.BRANDS);

        if (!brandStore.indexNames.contains("by_category")) {
          brandStore.createIndex("by_category", "categoryId");
        }

        if (!brandStore.indexNames.contains("by_business")) {
          brandStore.createIndex("by_business", "businessId");
        }

        if (!brandStore.indexNames.contains("by_category_business")) {
          brandStore.createIndex(
            "by_category_business",
            ["categoryId", "businessId"]
          );
        }
        
         // ---------------------------
        // USER
        // ---------------------------
        const userStore = getStore(TABLES.USER);


         // ---------------------------
        // SESSION
        // ---------------------------
        const sessionStore = getStore(TABLES.SESSION);

        if (!sessionStore.indexNames.contains("by_user")) {
          sessionStore.createIndex("by_user", "userId");
        }

         // ---------------------------
        // BUSINESS
        // ---------------------------
        const businessStore = getStore(TABLES.BUSINESS);

        if (!businessStore.indexNames.contains("by_user")) {
          businessStore.createIndex("by_user", "userId");
        }
         // ---------------------------
        // PRODUCTS
        // ---------------------------
        const brancheStore = getStore(TABLES.BRANCHES);

        if (!brancheStore.indexNames.contains("by_business")) {
          brancheStore.createIndex("by_business", "businessId");
        }

        // ---------------------------
        // ASSETS
        // ---------------------------
        const assetStore = getStore(TABLES.ASSETS);

        if (!assetStore.indexNames.contains("by_business_by_branch")) {
          assetStore.createIndex(
            "by_business_branch",
            ["businessId", "branchId"]
          );
        }

          // ---------------------------
        // LIABILITY
        // ---------------------------
        const liabilityStore = getStore(TABLES.LIABILITIES);

        if (!liabilityStore.indexNames.contains("by_business_branch")) {
          liabilityStore.createIndex(
            "by_business_branch",
            ["businessId", "branchId"]
          );
        }



      },

      blocked() {
        console.warn("DB upgrade blocked. Close other tabs.");
      },

      blocking() {
        console.warn("New DB version available. Refresh.");
      },

      terminated() {
        console.warn("DB connection terminated unexpectedly.");
      }
    });
  }

  return dbCache[dbName];
};