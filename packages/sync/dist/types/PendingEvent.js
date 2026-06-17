"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingEventStatus = void 0;
var PendingEventStatus;
(function (PendingEventStatus) {
    PendingEventStatus["PENDING"] = "PENDING";
    PendingEventStatus["RETRYING"] = "RETRYING";
    PendingEventStatus["CONFLICT"] = "CONFLICT";
    PendingEventStatus["FAILED"] = "FAILED";
})(PendingEventStatus || (exports.PendingEventStatus = PendingEventStatus = {}));
