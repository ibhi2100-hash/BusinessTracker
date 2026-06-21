"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventBus = void 0;
class InMemoryEventBus {
    constructor() {
        this.subscribers = new Set();
    }
    subscribe(subscriber) {
        this.subscribers.add(subscriber);
    }
    async publish(event) {
        return this.publishMany([event]);
    }
    async publishMany(events) {
        if (events.length === 0)
            return;
        const tasks = [];
        for (const subscriber of this.subscribers) {
            tasks.push(this.safeHandle(subscriber, events));
        }
        await Promise.allSettled(tasks);
    }
    async safeHandle(subscriber, events) {
        try {
            await subscriber.handle(events);
        }
        catch (err) {
            console.error("[EventBus] subscriber failed", subscriber.constructor?.name, err);
        }
    }
}
exports.InMemoryEventBus = InMemoryEventBus;
