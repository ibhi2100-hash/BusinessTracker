"use client"

import { useEffect } from "react";
import { useBusinessStore } from "@/store/businessStore";
import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";
import { dashboardReducer } from "@/offline/events/eventReducer";
import { useFinancialStore } from "@/store/financialDataStore";

export const useInitializeDashboard = () => {
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  useEffect(() => {
    const initialize = async () => {
      const db = await getDb();

      // Load latest snapshot
      const snapshots = await db.getAll(TABLES.SNAPSHOT);
      const snapshotState = snapshots[0] || null;

      // Load unsynced events
      const events = await db.getAllFromIndex(TABLES.EVENTS, "by_synced", 0);

      let state = snapshotState || {
        cashAtHand: 0,
        todaySales: 0,
        inventoryValue: 0,
        profit: 0,
        assetValue: 0,
        liabilityValue: 0
      };

      // Replay events
      for (const event of events) {
        state = dashboardReducer(state, event);
      }

      // Update financial store
      useFinancialStore.getState().setDashboardSummary(state);

      // Optional: hydrate business store if needed
      setBusiness(snapshotState?.business || null);
    };

    initialize();
  }, [setBusiness]);
};