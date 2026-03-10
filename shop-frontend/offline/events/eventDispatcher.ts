import { dashboardReducer } from "./eventReducer";
import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";
import { createEvent } from "./eventFactory";
import { generateLedgerEntries } from "../ledger/ledgerGenerator";
import { useFinancialStore } from "@/store/financialDataStore"
import { addDashboardSnapshot } from "@/offline/db/helpers";
import { useBusinessStore } from "@/store/businessStore";

export const dispatchEvent = async (type: string, payload: any) => {
  const db = await getDb()

  const event = createEvent(type, payload)
  // Save event
  await db.add(TABLES.EVENTS, event)

  // Generate ledger
  const ledgerEntries = generateLedgerEntries(event)

  const tx = db.transaction(TABLES.LEDGER_ENTRIES, "readwrite")

  for (const entry of ledgerEntries) {
    tx.store.add(entry)
  }

  await tx.done

  // Update UI via reducer
  const store = useFinancialStore.getState()

  const newState = dashboardReducer(store.dashboardSummary, event)

  store.setDashboardSummary(newState)
}