import Dexie, { Table } from "dexie";
import { getDbName, DB_VERSION, TABLES } from "./schema";
import { BaseEvent } from "@/offline/core/events/types";
import { Business, Branch, Product, User } from "@/types/types";
import { LedgerEntry } from "../domain/ledger";

// ---------------------------
// DOMAIN TYPES
// ---------------------------


export interface Inventory {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  costPrice: number;
  updatedAt?: number;
  createdAt?: number;
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

export interface Snapshot {
  id: string;
  businessId: string;
  branchId: string;
  createdAt: number;
}

// ---------------------------
// DB CLASS
// ---------------------------

export class AppDB extends Dexie {
  events!: Table<BaseEvent, string>;
  inventory!: Table<Inventory, string>;
  products!: Table<Product, string>;
  ledgerEntries!: Table<LedgerEntry, string>;
  categories!: Table<Category, string>;
  brands!: Table<Brand, string>;
  users!: Table<User, string>;
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
        "id,status,synced,type,createdAt,businessId,branchId,aggregateId,aggregateType,[status+synced],[type+createdAt],[aggregateType+aggregateId]",

      inventory:
        "id,productId,branchId,updatedAt,[productId+branchId]",

      products:
        "id,name,brandId,categoryId,businessId,branchId,createdAt,[businessId+branchId],[businessId+name]",

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

      snapshots:
        "id,businessId,branchId,createdAt,[businessId+branchId]",
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