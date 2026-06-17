"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyError = classifyError;
const SyncError_1 = require("../types/SyncError");
function classifyError(message) {
    if (message.includes("validation")) {
        return SyncError_1.SyncErrorCode.VALIDATION;
    }
    if (message.includes("duplicate")) {
        return SyncError_1.SyncErrorCode.DUPLICATE_EVENT;
    }
    if (message.includes("not found")) {
        return SyncError_1.SyncErrorCode.AGGREGATE_NOT_FOUND;
    }
    if (message.includes("rule")) {
        return SyncError_1.SyncErrorCode.BUSINESS_RULE;
    }
    return SyncError_1.SyncErrorCode.UNKNOWN;
}
