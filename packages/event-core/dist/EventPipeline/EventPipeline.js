"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPipeline = void 0;
class EventPipeline {
    constructor(repository, mapper, bus) {
        this.repository = repository;
        this.mapper = mapper;
        this.bus = bus;
    }
    async append(event) {
        return this.appendMany([event]);
    }
    async appendMany(events) {
        if (events.length === 0)
            return;
        await this.repository.appendMany(events);
        const publishedEvents = this.mapper.mapMany(events);
        await this.bus.publishMany(publishedEvents);
    }
}
exports.EventPipeline = EventPipeline;
