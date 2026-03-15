import { dashboardReducer } from "./eventReducer";
import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";
import { createEvent } from "./eventFactory";
import { generateLedgerEntries } from "../ledger/ledgerGenerator";
import { useFinancialStore } from "@/store/financialDataStore"
import { syncEvent } from "../sync/syncEngine";
export const dispatchEvent = async (event: any) => {

  const db = await getDb()

  const ledgerEntries = generateLedgerEntries(event)

  const tx = db.transaction(
    [TABLES.EVENTS, TABLES.LEDGER_ENTRIES],
    "readwrite"
  )

  await tx.objectStore(TABLES.EVENTS).add(event)

  for (const entry of ledgerEntries) {
    await tx.objectStore(TABLES.LEDGER_ENTRIES).add(entry)
  }

  await tx.done

  // reducer update
  const store = useFinancialStore.getState()

  const newState = dashboardReducer(
    store.dashboardSummary,
    event
  )

  store.setDashboardSummary(newState)

  // background sync
  syncEvent().catch(() => {
    console.warn("Sync failed, will retry later")
  })
}