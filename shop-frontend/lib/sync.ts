import { apiClient } from "./api-client";
import { getQueue, clearQueue } from "./offlineQueue";

export async function syncPendingSales() {
    const pending = await getQueue();

    for( const sale of pending) {
        try {
            await apiClient.post("sales", sale)
        } catch (error) {
            return
        }
    }

    await clearQueue();
}
