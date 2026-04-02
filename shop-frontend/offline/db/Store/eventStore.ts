import { TABLES } from "../schema";
import { getDb } from "../connection";

const eventStore = db.createObjectStore(TABLES.EVENTS, {
  keyPath: "id",
});

eventStore.createIndex("by_status", "status");
eventStore.createIndex("by_synced", "synced");
eventStore.createIndex("by_type", "type");
eventStore.createIndex("by_createdAt", "createdAt");

// 🔥 REQUIRED (compound index)
eventStore.createIndex(
  "by_business_branch",
  ["businessId", "branchId"]
);