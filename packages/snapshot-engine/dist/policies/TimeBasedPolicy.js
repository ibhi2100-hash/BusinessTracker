"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeBasedPolicy = void 0;
class TimeBasedPolicy {
    constructor(intervalMs) {
        this.intervalMs = intervalMs;
    }
    shouldSnapshot(context) {
        if (!context.lastSnapshotAt)
            return true;
        return (context.now.getTime() -
            context.lastSnapshotAt.getTime()) >= this.intervalMs;
    }
}
exports.TimeBasedPolicy = TimeBasedPolicy;
