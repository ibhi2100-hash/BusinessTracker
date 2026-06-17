"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetryable = isRetryable;
function isRetryable(message) {
    if (message.includes("validation"))
        return false;
    if (message.includes("duplicate"))
        return false;
    if (message.includes("network"))
        return true;
    return true;
}
