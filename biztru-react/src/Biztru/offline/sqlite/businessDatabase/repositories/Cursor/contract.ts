export interface SyncCursorRepository {
    getCursor(stream?: string): Promise<string>;

    advanceCursor(
        cursor: string,
        stream?: string
    ): Promise<void>;
}