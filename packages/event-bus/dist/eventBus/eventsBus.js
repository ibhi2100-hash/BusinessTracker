"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventBus = void 0;
class InMemoryEventBus {
    constructor() {
        this.subscribers = [];
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }
    async publish(events) {
        for (const subscriber of this.subscribers) {
            await subscriber.handle(events);
        }
    }
}
exports.InMemoryEventBus = InMemoryEventBus;
