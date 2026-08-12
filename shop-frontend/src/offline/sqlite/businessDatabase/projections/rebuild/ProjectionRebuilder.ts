import { SQLiteEventRepository } from "../../repositories/SQLiteEventRepository/eventStore";
import { ProjectionEventBus } from "@/src/buses/ProjectionBuses";
import { ProjectionResetter } from "./ProjectionResetterContract";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { ProjectionRebuildOptions, ProjectionRebuildResult } from "./types";
import { RebuildObserver } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";


export class ProjectionRebuilder {
  constructor(
    private readonly transaction: TransactionManager,
    private readonly eventStore: SQLiteEventRepository,
    private readonly projectionBus: ProjectionEventBus,
    private readonly projectionResetter: ProjectionResetter,
    private readonly observer: RebuildObserver<DomainEvent>         // injected
  ) {}

  async rebuild(
    options: ProjectionRebuildOptions = {}
  ): Promise<ProjectionRebuildResult> {

    const startedAt = Date.now();
    let eventsProcessed = 0;
    let lastLogicClock = options.fromLogicalClock ?? 0;

    try {
      await this.observer.onStarted?.();

      await this.transaction.run(async () => {
        await this.observer.onResetStarted?.();
        await this.projectionResetter.resetAll();
        await this.observer.onResetCompleted?.();

        for await (const batch of this.eventStore.stream(options)) {
          for (const event of batch) {
            await this.observer.onEventStarted?.(event);

            // Manually drive every consumer so we can observe each one
            for (const consumer of this.projectionBus.getConsumers()) {
              const name = consumer.constructor.name;
              const consumerStarted = Date.now();

              await this.observer.onConsumerStarted?.(consumer, event);

              try {
                await consumer.handle([event]);
                await this.observer.onConsumerCompleted?.(
                  consumer,
                  event,
                  Date.now() - consumerStarted
                );
              } catch (error) {
                await this.observer.onConsumerFailed?.(consumer, event, error);
                throw error;
              }
            }

            await this.observer.onEventCompleted?.(event);
            eventsProcessed++;
            lastLogicClock = event.logicClock;
          }
        }
      });

      const result: ProjectionRebuildResult = {
        eventsProcessed,
        fromLogicClock: options.fromLogicalClock ?? 0,
        toLogicClock: lastLogicClock,
        durationMs: Date.now() - startedAt
      };

      await this.observer.onCompleted?.();
      return result;

    } catch (error) {
      await this.observer.onFailed?.(error);
      throw error;
    }
  }
}