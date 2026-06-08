import Dexie, { Table } from "dexie";
import { getDbName, DB_VERSION, TABLES } from "./schema";
import { BaseEvent, LedgerEntry } from "@business/shared-types"
import { Business, Branch, Product, User, Snapshot, Inventory } from "@business/shared-types";
import { AggregateRecord, ReplicaMeta } from "@/offline/domain/aggregate";


// ---------------------------
// DOMAIN TYPES
// ---------------------------

export interface AuthData {
  id: "current"
  user: any;
  business: any;
  branches: any[];
  activeBranch: any;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
}

export interface Brand {
  id: string;
  businessId: string;
  categoryId?: string;
  name: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: number;

}

export interface Sales {
  
  id: string;
  businessId?: string;
  branchId?: string;
  productId: string;
  costPrice: number;
  aggregateId: string;
  amount: number;
  createdAt: Date;

}


export interface Asset {
  id: string;
  businessId: string;
  branchId: string;
}

export interface Liability {
  id: string;
  businessId: string;
  branchId: string;
}


// ---------------------------
// DB CLASS
// ---------------------------

export class AppDB extends Dexie {
  events!: Table<BaseEvent, string>;
  aggregates!: Table<AggregateRecord, string>;
  replicaMeta!: Table<ReplicaMeta, string>;
  inventory!: Table<Inventory, string>;
  products!: Table<Product, string>;
  sales!: Table<Sales, String>;
  ledgerEntries!: Table<LedgerEntry, string>;
  categories!: Table<Category, string>;
  brands!: Table<Brand, string>;
  users!: Table<User, string>;
  auth!: Table<AuthData, string>;
  sessions!: Table<Session, string>;
  businesses!: Table<Business, string>;
  branches!: Table<Branch, string>;
  assets!: Table<Asset, string>;
  liabilities!: Table<Liability, string>;
  snapshots!: Table<Snapshot, string>;

  constructor(name: string) {
    super(name);

    this.version(DB_VERSION).stores({
      events:
        "id,status,synced,type,createdAt,businessId,branchId,aggregateId,aggregateType,[status+synced],[type+createdAt],[aggregateType+aggregateId],[nextRetryAt+status]",

      aggregates:
        "id,aggregateId,aggregateType,version,lastGlobalPosition,lastSnapshotVersion,[aggregateType+aggregateId]",
      
      auth: 
        "id",

      snapshots:
        "id,aggregateId,aggregateType,version,lastGlobalPosition,[aggregateType+aggregateId]",

      replicaMeta:
        "deviceId,lastLogicClock",



      inventory:
        "id,productId,branchId,updatedAt,[productId+branchId]",

      products:
        "id,name,brandId,categoryId,businessId,branchId,createdAt,[businessId+branchId],[businessId+name]",
      sales: 
        "id,productId,createdAt",

      ledgerEntries:
        "id,eventId,account,branchId,businessId,createdAt,[eventId],[businessId+branchId],[account+createdAt]",

      categories:
        "id,businessId,name,[name+businessId]",

      brands:
        "id,businessId,categoryId,[categoryId+businessId]",

      users:
        "id",

      sessions:
        "id,userId,createdAt",

      businesses:
        "id,userId,createdAt",

      branches:
        "id,businessId",

      assets:
        "id,businessId,branchId,[businessId+branchId]",

      liabilities:
        "id,businessId,branchId,[businessId+branchId]",
    });

    this.on("blocked", () => {
      console.warn("[DB] Upgrade blocked — close other tabs.");
    });

    this.on("versionchange", () => {
      this.close();
    });
  }
}

// ---------------------------
// DB CACHE
// ---------------------------

const dbCache: Record<string, AppDB> = {};

// ---------------------------
// FACTORY
// ---------------------------

export const getDb = (userId?: string): AppDB | null => {
  if (typeof window === "undefined") return null;

  const dbName = getDbName(userId);

  if (!dbCache[dbName]) {
    const db = new AppDB(dbName);

    db.open().catch((err) => {
      console.error("[DB] failed to open:", err);
    });

    dbCache[dbName] = db;
  }

  return dbCache[dbName];
};

// ---------------------------
// TRANSACTION
// ---------------------------

export async function runTx<T>(
  db: AppDB,
  fn: () => Promise<T>,
  ...tables: Table<any, any>[]
): Promise<T> {
  return (db.transaction as any)("rw", ...tables, fn);
}