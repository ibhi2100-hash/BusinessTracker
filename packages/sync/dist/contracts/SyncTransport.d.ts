import { SyncRequest } from "../types/SyncRequest";
import { SyncResponse } from "../types/SyncResponse";
export interface SyncTransport {
    syncAggregate(request: SyncRequest): Promise<SyncResponse>;
}
