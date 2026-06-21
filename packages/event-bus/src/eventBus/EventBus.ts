import { EventBus } from "../contracts/EventBus";
import { EventSubscriber } from "../contracts/EventSubscriber";

export class InMemoryEventBus<TEvent>
  implements EventBus<TEvent>
{
  private subscribers: Set<EventSubscriber<TEvent>> = new Set();

  subscribe(subscriber: EventSubscriber<TEvent>): void {
    this.subscribers.add(subscriber);
  }

  async publish(event: TEvent): Promise<void> {
    return this.publishMany([event]);
  }

  async publishMany(events: TEvent[]): Promise<void> {
    if (events.length === 0) return;

    const tasks: Promise<void>[] = [];

    for (const subscriber of this.subscribers) {
      tasks.push(this.safeHandle(subscriber, events));
    }

    await Promise.allSettled(tasks);
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