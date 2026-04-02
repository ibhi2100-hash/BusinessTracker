// /offline/bootstrap/appBootstrap.ts

import { getDb } from "../db/indexDB";
import { TABLES } from "../db/schema";
import { clearUserData } from "../db/clearUserData";

import { useInventoryStore } from "@/store/inventoryStore";
import { useFinancialStore } from "@/store/financialDataStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { resetAllStores } from "@/store/resetAllStore";

export async function appBootstrap(router?: any) {
  try {
    // -----------------------------
    // 1️⃣ SERVER AUTH (SOURCE OF TRUTH)
    // -----------------------------
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Not authenticated");

    const data = await res.json();

    // -----------------------------
    // 2️⃣ HYDRATE CORE STORES
    // -----------------------------
    useAuthStore.setState({
      user: data.user,
    });

    useBusinessStore.setState({
      business: data.business,
    });

    useBranchStore.setState({
      branches: data.branches,
      activeBranchId: data.activeBranch?.id,
    });

    // -----------------------------
    // 3️⃣ LOAD USER-SCOPED DB
    // -----------------------------
    const db = await getDb(); // must already be user-scoped

    // 🔥 SNAPSHOT FIRST (future-proof)
    const snapshot = await db.get(TABLES.SNAPSHOT, "main");

    if (snapshot) {
      useInventoryStore.setState({ products: snapshot.data.products || [] });
      useFinancialStore.setState({ ledger: snapshot.data.ledger || [] });
    } else {
      const [products, ledger] = await Promise.all([
        db.getAll(TABLES.PRODUCTS),
        db.getAll(TABLES.LEDGER_ENTRIES),
      ]);

      useInventoryStore.setState({ products });
      useFinancialStore.setState({ ledger });
    }

    return true;
  } catch (err) {
    console.warn("Bootstrap failed:", err);

    // -----------------------------
    // 4️⃣ HARD RESET (CRITICAL)
    // -----------------------------
    await clearUserData();
    resetAllStores();

    if (router) router.replace("/login");

    return false;
  }
}