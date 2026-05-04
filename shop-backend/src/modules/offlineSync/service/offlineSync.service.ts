import { Events } from "../../../domain/event.js";
import { SyncRepository } from "../repository/syncRepository.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { generateLedgerEntries } from "../../ledger/ledgerGenerator/ledgerGenerator.js";


export class OfflineSyncService {
  constructor(
    private syncRepository: SyncRepository,
  ) {}

  async syncEvents(events: Events[]) {
    const results: any[] = [];
   
    for (const event of events) {
      try {
        await prisma.$transaction(async (tx) => {

          // 1️⃣ Idempotency (event-level)
          const exists = await this.syncRepository.findExistingEvent(event.id, tx);
          if (exists) {
            results.push({ eventId: event.id, status: "duplicate" });
            return;
          }

          // 2️⃣ Store raw event
          await this.syncRepository.storeEvents(event, tx);
          console.log("We successfully Added event to event Table: ", event)

          // 4️⃣ Generate ledger (shared deterministic logic)
          const entries = generateLedgerEntries(event);

          results.push({ eventId: event.id, status: "synced" });
        });

      } catch (error) {

        await this.syncRepository.markFailed(event, String(error));

        results.push({
          eventId: event.id,
          status: "failed",
          error: String(error)
        });
      }
    }

    return results;
  }
  async getBusinessEvents(event: Events, version: number ) {
  
        const events = await this.syncRepository.findEventAfterSnapshotVersion(event, version);

      return events
    }

  async businessSnapshots(events: Events[]) {
    const results: any[] = [];
   
    for (const event of events) {
      try {
        await prisma.$transaction(async (tx) => {

          // 1️⃣ Idempotency (event-level)
          const exists = await this.syncRepository.findExistingEvent(event.id, tx);
          if (exists) {
            results.push({ eventId: event.id, status: "duplicate" });
            return;
          }

          // 2️⃣ Store raw event
          await this.syncRepository.storeEvents(event, tx);

          // 4️⃣ Generate ledger (shared deterministic logic)
          const entries = generateLedgerEntries(event);

          // 6️⃣ Persist ledger (idempotent)
          await this.syncRepository.createLedger(entries, event.businessId, tx);

          // 7️⃣ Update account snapshots (ledger-driven)
          await this.syncRepository.updateAccountSnapshots(
            event.branchId,
            tx
          );

          // 8️⃣ Mark processed
          await this.syncRepository.markProcessed(event, tx);

          results.push({ eventId: event.id, status: "synced" });
        });

      } catch (error) {

        await this.syncRepository.markFailed(event, String(error));

        results.push({
          eventId: event.id,
          status: "failed",
          error: String(error)
        });
      }
    }

    return results;
  }

}