"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionEventBus = void 0;
class ProjectionEventBus {
    constructor() {
        this.consumers = new Set();
    }
    subscribe(consumer) {
        this.consumers.add(consumer);
    }
    unsubscribe(consumer) {
        this.consumers.delete(consumer);
    }
    getConsumers() {
        return [...this.consumers];
    }
    async publish(event) {
        await this.publishMany([event]);
    }
    async publishMany(events) {
        const startedAt = Date.now();
        for (const event of events) {
            for (const consumer of this.consumers) {
                try {
                    await consumer.handle([event]);
                }
                catch (error) {
                    throw error;
                }
            }
        }
    }
}
exports.ProjectionEventBus = ProjectionEventBus;
