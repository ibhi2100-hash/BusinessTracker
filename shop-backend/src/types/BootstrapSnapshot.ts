import type { Business } from "@business/shared-types";
import type { Branch } from "@business/shared-types";
import type { Product } from "@business/shared-types";
import type { Inventory } from "@business/shared-types";
import type { Sales } from "@business/shared-types";
import type { Expense } from "@business/shared-types";
import type { LedgerEntry } from "@business/shared-types";


export interface BootstrapSnapshot {

    businessId: string;

    branchId: string;

    business: Business;

    branches: Branch[];

    products: Product[];

    inventories: Inventory[];

    sales: Sales[];

    expenses: Expense[];

    ledgerEntries: LedgerEntry[];

    snapshotPosition: bigint;
}