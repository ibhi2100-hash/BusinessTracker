import {
    SyncStateStatements
} from "../../statements/syncState/syncStateStatements";

import {
    SyncStateRepository
} from "../../sync/syncEngine";

export interface SyncState {
    stream: number;

    cursor: number;

    updatedAt: number
}


export class SQLiteSyncStateRepository
    implements SyncStateRepository {

    constructor(
        private readonly statements:
            SyncStateStatements
    ) {}


    async getCursor(): Promise<number> {

        const row =
            await this.statements
                .getCursor
                .query<SyncState>();

        const syncState = row[0]

        return syncState?.cursor ?? 0;
    }


    async setCursor(
        cursor: number
    ): Promise<void> {

        await this.statements
            .setCursor
            .execute([
                "BUSINESS",
                cursor,
                Date.now()
            ])
    }


    async advanceCursor(
        cursor: number
    ): Promise<void> {

        await this.statements
            .advanceCursor
            .execute([
                cursor,
                Date.now(),
                "BUSINESS",
                cursor
            ])
    }

}