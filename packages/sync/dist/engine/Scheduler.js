"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
class Scheduler {
    constructor(sync, interval = 30000) {
        this.sync = sync;
        this.interval = interval;
    }
    start() {
        this.stop();
        this.timer =
            setInterval(() => {
                void this.sync();
            }, this.interval);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer =
                undefined;
        }
    }
}
exports.Scheduler = Scheduler;
