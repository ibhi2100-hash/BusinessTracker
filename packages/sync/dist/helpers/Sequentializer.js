"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSequential = isSequential;
function isSequential(events) {
    for (let i = 1; i < events.length; i++) {
        if (events[i].aggregateVersion !==
            (events[i - 1].aggregateVersion ?? 0) + 1) {
            return false;
        }
    }
    return true;
}
