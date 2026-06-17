"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncErrorCode = void 0;
var SyncErrorCode;
(function (SyncErrorCode) {
    SyncErrorCode["UNKNOWN"] = "UNKNOWN";
    SyncErrorCode["VALIDATION"] = "VALIDATION";
    SyncErrorCode["VERSION_CONFLICT"] = "VERSION_CONFLICT";
    SyncErrorCode["BUSINESS_RULE"] = "BUSINESS_RULE";
    SyncErrorCode["DUPLICATE_EVENT"] = "DUPLICATE_EVENT";
    SyncErrorCode["EVENT_TOO_OLD"] = "EVENT_TOO_OLD";
    SyncErrorCode["EVENT_TOO_NEW"] = "EVENT_TOO_NEW";
    SyncErrorCode["AGGREGATE_NOT_FOUND"] = "AGGREGATE_NOT_FOUND";
    SyncErrorCode["NETWORK"] = "NETWORK";
    SyncErrorCode["SERVER"] = "SERVER";
    SyncErrorCode["AUTHENTICATION"] = "AUTHENTICATION";
})(SyncErrorCode || (exports.SyncErrorCode = SyncErrorCode = {}));
