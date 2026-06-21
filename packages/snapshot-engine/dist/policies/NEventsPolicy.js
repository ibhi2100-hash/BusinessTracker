"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveryNEventsPolicy = void 0;
class EveryNEventsPolicy {
    constructor(threshold) {
        this.threshold = threshold;
    }
    shouldSnapshot(context) {
        return context.eventCountSinceSnapshot >= this.threshold;
    }
}
exports.EveryNEventsPolicy = EveryNEventsPolicy;
