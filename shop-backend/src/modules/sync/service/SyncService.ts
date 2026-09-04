import { DomainEvent } from "@business/shared-types";
import { RepositoryRegistry } from "../repositories/RepositoryRegistry.js";
import { EventValidator } from "./EventValidator.js";
import { ProjectionEventBus } from "@business/event-bus";
import { BackendEvent } from "../repositories/eventRepository.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export interface SyncConflict {
  eventId: string;

  aggregateId: string;
  aggregateType: string;

  expectedAggregateVersion: number;
  serverAggregateVersion: number;

  serverEvents: BackendEvent[];
}
export class OfflineSyncService {
  constructor(
    private readonly repositories: RepositoryRegistry,
    private readonly eventValidator: EventValidator,
    private readonly projectionBus: ProjectionEventBus
  ) {}

  async push(events: DomainEvent[]) {
    const accepted: string[] = [];
    const rejected: any[] = [];
    const conflicts: SyncConflict[] = [];

    for (const event of events) {
      const serverVersion =
        await this.repositories.aggregates.getAggregateVersion(
          event.aggregateId,
          event.aggregateType
        );

      if (
        event.expectedAggregateVersion !== serverVersion
      ) {
        const serverEvents =
          await this.repositories.events.loadAggregateTail(
            event.aggregateId,
            event.aggregateType,
            event.expectedAggregateVersion
          );

        conflicts.push({
          eventId: event.id,

          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,

          expectedAggregateVersion:
            event.expectedAggregateVersion,

          serverAggregateVersion: serverVersion!,

          serverEvents,
        });

        continue;
      }

      return prisma.$transaction(async (tx) => {
        let version = serverVersion

        try {
            version++;

            const saved = 
                await this.repositories.events.append(
                    event,
                    version,
                    tx
                );

            await this.projectionBus.publish(event)
            
        } catch (error) {
            
        }
      })
    }

    return {
      accepted,
      rejected,
      conflicts,
    };
  }
}