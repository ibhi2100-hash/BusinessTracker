import { OutboxStatments } from "../../statements/outbox/outboxStatements";

interface NewOutboxEntry {
    id: string;
    eventId: string;
    createdAt: number;
}
interface OutBoxRow {
    id: string,
    eventId: string;
    status: string;
    retryCount: number;
    maxAttempts: number;
    nextRetryAt: number | null;
    lockedUntil: number | null;
    lastError: string | null;
    createdAt: number;
    syncedAt: number;

    globalPosition: number | null;
    aggregateVersion: number | null;
    server_commit_time: number | null;
}

interface OutBoxtData {
     id: string,
    eventId: string;
    status?: string;
    retryCount?: number;
    maxAttempts?: number;
    nextRetryAt?: number;
    lockedUntil?: number;
    lastError?: string;
    createdAt: number;
    syncedAt?: number;

    globalPosition?: number ;
    aggregateVersion?: number;
    server_commit_time?: number;

}

export class SQLiteOutboxRepository {
    constructor(
        private readonly statements: OutboxStatments
    ){}

    async insert(outboxData: OutBoxtData){
        await this.statements.insert.execute(
            OutboxMapper.toInsert(outboxData)
        )
    }

    async getPending(): Promise<any>{
        const rows = await this.statements.pendingEvents.query()

        return rows
    }
}

class OutboxMapper {
    static toInsert(
        outboxData: OutBoxtData
    ): unknown[] {
        return [
            outboxData.id,
            outboxData.eventId,

            outboxData.status ?? "PENDING",
            outboxData.retryCount ?? 0,
            outboxData.maxAttempts ?? 10,

            outboxData.nextRetryAt ?? null,
            outboxData.lockedUntil ?? null,
            outboxData.lastError ?? null,

            outboxData.createdAt,

            outboxData.syncedAt ?? null,
            outboxData.globalPosition ?? null,
            outboxData.aggregateVersion ?? null,
            outboxData.server_commit_time ?? null
        ];
    }
}