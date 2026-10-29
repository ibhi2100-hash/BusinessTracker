import type { SyncCursorRepository } from "./contract";
import { SyncCursorStatements } from "../../statements/cursor/CursorStatement"; 

interface SyncCursorRow {
    stream: string;
    cursor: string;
    updatedAt: number;
}

const DEFAULT_STREAM = "BUSINESS";
const SQLITE_MAX_INT64 = 9223372036854775807n;

function parseCursor(cursor: string): bigint {
    if (!/^(0|[1-9]\d*)$/.test(cursor)) {
        throw new Error(`Invalid sync cursor: ${cursor}`);
    }

    const value = BigInt(cursor);

    if (value > SQLITE_MAX_INT64) {
        throw new Error(
            `Sync cursor exceeds SQLite's signed 64-bit integer range: ${cursor}`
        );
    }

    return value;
}

export class SQLiteSyncCursorRepository
    implements SyncCursorRepository {

    private readonly statements: SyncCursorStatements;

    constructor(statements: SyncCursorStatements) {
        this.statements = statements;
    }

    async getCursor(
        stream: string = DEFAULT_STREAM
    ): Promise<string> {
        await this.statements.ensure.execute([
            stream,
            "0",
            Date.now(),
        ]);

        const rows =
            await this.statements.get.query<SyncCursorRow>([
                stream,
            ]);

        const row = rows[0];

        if (!row) {
            throw new Error(
                `Sync cursor was not initialized for stream '${stream}'.`
            );
        }

        const cursor = String(row.cursor);
        parseCursor(cursor);

        return cursor;
    }

    async advanceCursor(
        cursor: string,
        stream: string = DEFAULT_STREAM
    ): Promise<void> {
        const next = parseCursor(cursor);
        const current = parseCursor(
            await this.getCursor(stream)
        );

        if (next < current) {
            return;
        }

        await this.statements.advance.execute([
            cursor,
            Date.now(),
            stream,
            cursor,
        ]);

        const persisted = parseCursor(
            await this.getCursor(stream)
        );

        if (persisted < next) {
            throw new Error(
                `Could not advance sync cursor for stream '${stream}'.`
            );
        }
    }
}