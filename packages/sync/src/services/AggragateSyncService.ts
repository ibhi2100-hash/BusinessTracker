import { SyncRepository } from "../contracts/SyncRepository";
import { SyncTransport } from "../contracts/SyncTransport";

export class AggregateSyncService {

  constructor(
    private repository:
      SyncRepository,

    private transport:
      SyncTransport
  ) {}

  async syncAggregate(
    events: any[]
  ) {

    const first =
      events[0];

    const synced =
      await this.repository
        .getSyncedEvents(
          first.aggregateId,
          first.aggregateType
        );

    const last =
      synced[
        synced.length - 1
      ];

    const baseVersion =
      last?.aggregateVersion ??
      0;

    return this.transport
      .syncAggregate({
        aggregateId:
          first.aggregateId,

        aggregateType:
          first.aggregateType,

        baseVersion,

        events
      });
  }
}