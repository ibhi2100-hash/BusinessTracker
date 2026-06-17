"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectivityWatcher = void 0;
class ConnectivityWatcher {
    constructor(engine) {
        this.engine = engine;
    }
    start() {
        window.addEventListener("online", () => void this.engine.sync());
    }
    stop() { }
}
exports.ConnectivityWatcher = ConnectivityWatcher;
