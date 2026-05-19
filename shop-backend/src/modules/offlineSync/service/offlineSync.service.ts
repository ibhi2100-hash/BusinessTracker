import { SyncRepository } from "../repository/syncRepository.js";
import { LedgerRepository } from "../../ledger/ledgerRepository.js";
import { HanldeEvent } from "../proccessor/processEvent.js";
import { generateLedgerEntries } from "../../../../../shared/ledgerGenerator.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { toDomainEvent } from "../../../helpers/mapper.js";

export class OfflineSyncService {
  constructor(
    private syncRepository: SyncRepository,
    private ledgerRepo: LedgerRepository
  ) {}

  async syncAggregateBatch({
    aggregateId,
    aggregateType,
    baseVersion,
    events,
  }: {
    aggregateId: string;
    aggregateType: string;
    baseVersion: number;
    events: any[];
  }) {

    const serverLast =
      await this.syncRepository.getLastAggregateVersion(
        aggregateId,
        aggregateType
      );

    const serverVersion = serverLast?.aggregateVersion ?? 0;
    console.log("This is the server Version: ", serverVersion)
    // ---------------------------
    // CONFLICT DETECTION
    // ---------------------------
    if (baseVersion !== serverVersion) {
      const serverEvents =
        await this.syncRepository.findEventsAfterSnapshotVersion(
          aggregateId,
          aggregateType,
          baseVersion
        );

      return {
        success: [],
        failed: [],
        conflicts: [
          {
            aggregateId,
            aggregateType,
            serverVersion,
            serverEvents,
          },
        ],
        serverState: {
          version: serverVersion,
          lastGlobalPosition: serverLast?.globalPosition,
        },
      };
    }

    // ---------------------------
    // APPLY AS SINGLE ATOMIC BATCH
    // ---------------------------
    return prisma.$transaction(async (tx) => {

      let version = serverVersion;

      const success: any[] = [];
      const failed: any[] = [];

      for (const event of events) {
        try {

          version++;

          const enrichedEvent = {
            ...event,
            aggregateVersion: version,
          };

          const saved =
            await this.syncRepository.storeEvent(
              enrichedEvent,
              tx
            );
            console.log("This is the saved Event in the backend", saved)

          const entries =
            generateLedgerEntries(saved);

          if (entries.length) {
            await this.ledgerRepo.bulkAddEntries(
              entries,
              saved.businessId!,
              saved.branchId!,
              tx
            );
          }

          await HanldeEvent(toDomainEvent(saved), tx);

          await this.syncRepository.markProcessed(
            saved,
            tx
          );

          success.push({
            eventId: saved.id,
            aggregateId,
            aggregateVersion: version,
          });

        } catch (error: any) {

          await this.syncRepository.markFailed(
            event,
            String(error)
          );

          failed.push({
            eventId: event.id,
            error: String(error),
          });
        }
      }

      const finalVersion = version;

      return {
        success,
        failed,
        conflicts: [],
        serverState: {
          version: finalVersion,
          lastGlobalPosition:
            serverLast?.globalPosition,
        },
      };
    });
  }
  async getAggregateEventsAfterVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ) {
    return this.syncRepository.findEventsAfterSnapshotVersion(
      aggregateId,
      aggregateType,
      version
    );
}
}