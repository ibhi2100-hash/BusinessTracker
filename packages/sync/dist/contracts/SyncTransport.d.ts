import { SyncRequest } from "../types/SyncRequest";
import { SyncResult } from "../types/SyncResult";
export interface SyncTransport {
    syncAggregate(request: SyncRequest): Promise<SyncResult>;
}
