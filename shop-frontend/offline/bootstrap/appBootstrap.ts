import { getDb } from "../db/connection";
import { TABLES } from "../db/schema";
import { useInventoryStore } from "@/store/inventoryStore";
import { useFinancialStore } from "@/store/financialDataStore";


 export async function appBootstrap() {
  const db = await getDb();

  // Parallel loading
  const [products, ledger] = await Promise.all([
    db.getAll(TABLES.PRODUCTS),
    db.getAll(TABLES.LEDGER_ENTRIES),
  ]);

  // If you rely purely on events:
  // const projections = rebuildFromEvents(events)

  // 3. Hydrate Zustand stores (atomic)
  useInventoryStore.setState({ products });
  useFinancialStore.setState({ ledger });

  // 4. Mark hydration complete
  return true;
}