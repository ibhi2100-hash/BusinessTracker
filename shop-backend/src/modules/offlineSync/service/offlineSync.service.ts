import { SyncRepository } from "../repository/syncRepository.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { createBackendLedgerEngine } from "../../../infrastructure/ledger/backendLedgerEngine.js";
import { BaseEvent } from "@business/shared-types";

export class OfflineSyncService {
  constructor(
    private syncRepository: SyncRepository,
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
    events: BaseEvent[];
  }) {

    const serverLast =
      await this.syncRepository.getLastAggregateVersion(
        aggregateId,
        aggregateType
      );

    const serverVersion = serverLast?.aggregateVersion ?? 0;

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

      let currentVersion = serverVersion

      const success: any[] = [];
      const failed: any[] = [];

      for (const event of events) {
        try {
          if(event.expectedAggregateVersion  !== currentVersion){
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
          currentVersion++;

          const enrichedEvent = {
            ...event,
            aggregateVersion: currentVersion,
          };

         const ledgerEngine = createBackendLedgerEngine(tx)
         await ledgerEngine.process(enrichedEvent)
          await this.syncRepository.markProcessed(
            enrichedEvent,
            tx
          );

          success.push({
            eventId: enrichedEvent.id,
            aggregateId,
            aggregateVersion: currentVersion,
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

      const finalVersion = currentVersion;

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