
export const EventInboxStatementKeys = {
    insert: "eventInbox.insert",
    delete: "eventInbox.delete",
    recordFailure: "eventInbox.recordFailure",
    count: "eventInbox.count",
    allInbox: "eventInbox.all",
    claimPending: "eventInbox.claimPending",
    recoverStale: "eventInbox.recoverStale",
} as const;
