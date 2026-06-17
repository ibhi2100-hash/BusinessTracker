"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupByAggregate = groupByAggregate;
function groupByAggregate(events) {
    const groups = new Map();
    for (const event of events) {
        const key = `${event.aggregateType}:${event.aggregateId}`;
        let group = groups.get(key);
        if (!group) {
            group = {
                aggregateId: event.aggregateId,
                aggregateType: event.aggregateType,
                events: []
            };
            groups.set(key, group);
        }
        group.events.push(event);
    }
    return [...groups.values()];
}
