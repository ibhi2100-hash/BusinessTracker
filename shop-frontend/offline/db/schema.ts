export const getDbName = (userId?: string) =>
  userId ? `business-app-${userId}` : "business-app-guest";

export const DB_VERSION = 2;

export const TABLES = {
    SNAPSHOT: "snapshot",
    EVENTS: "events",
    SESSION: "session",
    USER: "user",
    BUSINESS: "business",
    BRANCHES: "branches",
    CATEGORIES: "categories",
    BRANDS: "brands",
    PRODUCTS: "product-store",
    INVENTORY: "inventory",
    SALES: "sales",
    ASSETS: "assets",
    LIABILITIES: "liabilities",
    EXPENSES: "expenses",
    LEDGER_ENTRIES: "ledger_entries",
    SYNC_META: "sync_meta",
    BUSINESSDATA: "business-data",
    INVENTORYSTORE: "inventory-store",
    METADATA: "key"
    
    
    
}
