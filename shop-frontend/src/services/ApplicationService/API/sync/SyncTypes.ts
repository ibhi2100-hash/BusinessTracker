import { SyncManagementState } from "@/app/(app)/(sync-mgt)/sync-management/components/syncMgtPage";
import { SyncResult } from "@/src/offline/sqlite/businessDatabase/sync/syncEngine";


export interface SyncApplicationService {

    Sync(): Promise<SyncResult>;

    getState(): SyncManagementState;

    subscribe(
        listener: (
            state: SyncManagementState
        ) => void
    ): () => void;
}
