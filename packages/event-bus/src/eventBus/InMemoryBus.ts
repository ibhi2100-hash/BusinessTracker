import { EventBus } from "../contracts/EventBus";
import { EventSubscriber } from "../contracts/EventSubscriber";

export class InMemoryEventBus<TEvent>
  implements EventBus<TEvent>
{
  private readonly subscribers: Set<EventSubscriber<TEvent>> = new Set();

  subscribe(subscriber: EventSubscriber<TEvent>): void {
    this.subscribers.add(subscriber);
  }
  unsubscribe(
    subscriber: EventSubscriber<TEvent>
  ){
    this.subscribers.delete(subscriber)
  }
  async publish(event: TEvent): Promise<void> {
    return this.publishMany([event]);
  }

  async publishMany(events: TEvent[]): Promise<void> {
    await Promise.allSettled(
      [...this.subscribers].map(
        x => x.handle(events)
      )
    )
  }

  private async safeHandle(
    subscriber: EventSubscriber<TEvent>,
    events: TEvent[]
  ): Promise<void> {
    try {
      await subscriber.handle(events);
    } catch (err) {
      console.error(
        "[EventBus] subscriber failed",
        subscriber.constructor?.name,
        err
      );
    }
  }
}