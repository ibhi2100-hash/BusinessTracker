export var OutboxStatus;
(function (OutboxStatus) {
    OutboxStatus[OutboxStatus["PENDING"] = 0] = "PENDING";
    OutboxStatus[OutboxStatus["PROCESSING"] = 1] = "PROCESSING";
    OutboxStatus[OutboxStatus["RETRYING"] = 2] = "RETRYING";
    OutboxStatus[OutboxStatus["FAILED"] = 3] = "FAILED";
    OutboxStatus[OutboxStatus["DEAD"] = 4] = "DEAD";
    OutboxStatus[OutboxStatus["SYNCED"] = 5] = "SYNCED";
})(OutboxStatus || (OutboxStatus = {}));
