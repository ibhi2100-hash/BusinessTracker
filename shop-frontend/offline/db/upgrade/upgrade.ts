
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
  // EVENTS (FIXED)
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

  // 🔥 CRITICAL
  if (!eventStore.indexNames.contains("by_business_branch")) {
    eventStore.createIndex(
      "by_business_branch",
      ["businessId", "branchId"]
    );
  }

  // ---------------------------
  // INVENTORY (FIXED)
  // ---------------------------
  const inventoryStore = getStore(TABLES.INVENTORY);

  if (!inventoryStore.indexNames.contains("by_product_branch")) {
    inventoryStore.createIndex(
      "by_product_branch",
      ["productId", "branchId"],
      { unique: true } // 🔥 prevents duplicates
    );
  }

  if (!inventoryStore.indexNames.contains("by_product")) {
    inventoryStore.createIndex("by_product", "productId");
  }

  if (!inventoryStore.indexNames.contains("by_branch")) {
    inventoryStore.createIndex("by_branch", "branchId");
  }

  // ---------------------------
  // PRODUCTS (IMPROVED)
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
  // LEDGER (IMPROVED)
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
}