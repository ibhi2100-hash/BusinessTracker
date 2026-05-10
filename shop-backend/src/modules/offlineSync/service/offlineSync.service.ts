// offline-sync.service.ts

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

import { Event } from "../../../domain/event.js";

import { generateLedgerEntries } from "../../../../../shared/ledgerGenerator.js";

import { SyncRepository } from "../repository/syncRepository.js";

import { LedgerRepository } from "../../ledger/ledgerRepository.js";

import { HanldeEvent } from "../proccessor/processEvent.js";

export class OfflineSyncService {

  constructor(
    private syncRepository: SyncRepository,
    private ledgerRepo: LedgerRepository
  ) {}

  async syncEvents(events: Event[]) {

    const success: any[] = [];

    const failed: any[] = [];

    for (const event of events) {

      try {

        await prisma.$transaction(
          async (tx) => {

            /* -----------------------------------------
               STORE EVENT
            ----------------------------------------- */

            const saved =
              await this.syncRepository.storeEvent(
                event,
                tx
              );

            /* -----------------------------------------
               LEDGER GENERATION
            ----------------------------------------- */

            const entries =
              generateLedgerEntries(event);

            if (entries.length > 0) {

              await this.ledgerRepo.bulkAddEntries(
                entries,
                event.businessId,
                event.branchId,
                tx
              );
            }

            /* -----------------------------------------
               PROJECTIONS
               IMPORTANT:
               EVENTS REMAIN SOURCE OF TRUTH
            ----------------------------------------- */

            await HanldeEvent(
              saved,
              tx
            );

            /* -----------------------------------------
               PROCESSED MARKER
            ----------------------------------------- */

            await this.syncRepository.markProcessed(
              saved,
              tx
            );

            success.push({
              eventId: event.id,
              aggregateId:
                event.aggregateId,
              aggregateVersion:
                saved.aggregateVersion,
              status: "SYNCED",
            });
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          }
        );

      } catch (error: any) {

        await this.syncRepository.markFailed(
          event,
          String(error)
        );

        failed.push({
          eventId: event.id,
          aggregateId:
            event.aggregateId,
          status: "FAILED",
          error: String(error),
        });
      }
    }

    return {
      success,
      failed,
    };
  }

  async getAggregateEventsAfterVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ) {

    return this.syncRepository
      .findEventsAfterSnapshotVersion(
        aggregateId,
        aggregateType,
        version
      );
  }
}