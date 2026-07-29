import { StorageRequest, StorageResponse } from "../../../storage/protocol/messages";

self.onmessage = async (
    event: MessageEvent<StorageRequest>
) => {
    const message = event.data;
    const response: StorageResponse = {
        id: message.id,
        success: true
    };
    self.postMessage(response)
}