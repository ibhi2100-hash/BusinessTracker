import { Event } from "../../../domain/event.js";
import { SyncRepository } from "../repository/syncRepository.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { generateLedgerEntries } from "../../../../../shared/ledgerGenerator.js";
import { LedgerRepository } from "../../ledger/ledgerRepository.js";
import { HanldeEvent } from "../proccessor/processEvent.js";


export class OfflineSyncService {
  constructor(
    private syncRepository: SyncRepository,
    private ledgerRepo: LedgerRepository
  ) {}

  async syncEvents(events: Event[]) {
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

          const saved = await this.syncRepository.storeEvents(event, tx);
          console.log("Events that is save", saved)
          const entries = generateLedgerEntries(event);

          await this.ledgerRepo.bulkAddEntries(entries, event.businessId, event.branchId, tx);
          
          await HanldeEvent(event, tx);

          results.push({ eventId: event.id, status: "SYNCED", version: saved.version });
        });

      } catch (error: any) {
          console.error("SYNC ERROR:", error);
          console.error("STACK:", error?.stack);

          await this.syncRepository.markFailed(event, String(error));

          results.push({
            eventId: event.id,
            status: "FAILED",
            error: String(error)
          });
        }
    }

    return results;
  }
  async getBusinessEvents(event: Event, version: number ) {
  
        const events = await this.syncRepository.findEventAfterSnapshotVersion(event, version);

      return events
    }

  async businessSnapshots(events: Event[]) {
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
          const saved =  await this.syncRepository.storeEvents(event, tx);
          console.log("Events that is save", saved)

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