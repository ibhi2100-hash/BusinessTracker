"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupEventsByAggregate = groupEventsByAggregate;
function groupEventsByAggregate(events) {
    const map = new Map();
    for (const event of events) {
        const key = `${event.aggregateType}:${event.aggregateId}`;
        const existing = map.get(key);
        if (existing) {
            existing.push(event);
        }
        else {
            map.set(key, [event]);
        }
    }
    return Array.from(map.values())
        .map(group => group.sort((a, b) => a.logicClock -
        b.logicClock));
}
