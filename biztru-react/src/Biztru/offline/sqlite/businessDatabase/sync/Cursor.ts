export interface SyncStateRepository {

    /**
     * Last globally applied server position.
     */
    getCursor(): Promise<number>;

    /**
     * Persist the cursor after events have been safely applied locally.
     */
    setCursor(cursor: number): Promise<void>;
}