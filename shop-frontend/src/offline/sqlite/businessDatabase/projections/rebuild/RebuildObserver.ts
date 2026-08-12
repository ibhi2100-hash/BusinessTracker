import { useRebuilderStore } from "@/app/(app)/(dashboard)/projection/store/ProjectionRebuilderStore";
import { EventConsumer, RebuildObserver } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";

export class ProjectionRebuildObserver
implements RebuildObserver<DomainEvent>  {
    onStarted(): void {
        const store = 
            useRebuilderStore.getState();

            store.start()
    }
  onRebuildStarted(totalEvents: number) {
    const store =
      useRebuilderStore.getState();

    store.setTotalEvents(totalEvents);
  }

  onEventStarted(event: DomainEvent) {
    const store =
      useRebuilderStore.getState();

    store.setCurrentEvent({
      id: event.id,
      type: event.type,
      position: event.logicClock,
      status: "PROCESSING",
    });
  }
  onEventsLoaded(events: readonly DomainEvent<unknown>[]): void {
      
  }
  onEventCompleted(event: DomainEvent<unknown>): void {
      
  }

  onResetStarted(): void {
      useRebuilderStore.getState().setStatus("RESETTING")
  }
  onResetCompleted(): void {
      useRebuilderStore.getState().setStatus("REPLAYING");
  }

  onConsumerStarted(
    consumer: EventConsumer<DomainEvent>,
    event: DomainEvent
  ) {
    const store =
      useRebuilderStore.getState();

    const name =
      consumer.constructor.name;

    store.setCurrentConsumer(name);

    store.updateConsumer(name, {
      status: "PROCESSING",
      eventType: event.type,
    });

    store.updateEvent(event.id, {
      status: "PROCESSING",
      consumer: name,
    });
  }

  onConsumerCompleted(
    consumer: EventConsumer<DomainEvent>,
    event: DomainEvent
  ) {
    const store =
      useRebuilderStore.getState();

    const name =
      consumer.constructor.name;

    store.updateConsumer(name, {
      status: "COMPLETED",
      processedEvents: 1,
    });

    store.updateEvent(event.id, {
      status: "COMPLETED",
      consumer: name,
    });
  }
  onConsumerFailed(consumer: EventConsumer<DomainEvent>, event: DomainEvent, error: unknown) {
    const name = consumer.constructor.name;
    const message = error instanceof Error ? error.message : String(error);
    const store = useRebuilderStore.getState();
    store.updateConsumer(name, { status: "FAILED", error: message });
    store.updateEvent(event.id, { status: "FAILED", consumer: name, error: message });
    store.setError(message);
  }
  onCompleted() {
    const store =
      useRebuilderStore.getState();

    store.complete();
  }

  onFailed(error: unknown) {
    const store =
      useRebuilderStore.getState();

    store.setStatus("FAILED");

    store.setError(
      error instanceof Error
        ? error.message
        : String(error)
    );
  }
  onProjectionUpdated(projection: string, rows: number, position: number): void {
      
  }
  onCommitStarted(): void {
      
  }
}