"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRetryDelay = calculateRetryDelay;
function calculateRetryDelay(retryCount) {
    switch (retryCount) {
        case 1:
            return 1000;
        case 2:
            return 5000;
        case 3:
            return 15000;
        case 4:
            return 30000;
        case 5:
            return 60000;
        case 6:
            return 5 * 60 * 1000;
        case 7:
            return 15 * 60 * 1000;
        case 8:
            return 30 * 60 * 1000;
        case 9:
            return 60 * 60 * 1000;
        default:
            return 6 * 60 * 60 * 1000;
    }
}
