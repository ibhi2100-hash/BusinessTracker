import {
    BackendEventPayload,
    SyncPushResult,
    SyncPullResult,
    SyncTransport,
} from "./types";


export class HttpSyncTransport
    implements SyncTransport {

    constructor(
        private readonly baseUrl: string,
        private readonly getToken: () => Promise<string>
    ) {}

    async push(
        events: BackendEventPayload[]
    ): Promise<SyncPushResult> {

        if (events.length === 0) {
            return {
                accepted: [],
                rejected: [],
            };
        }

        const token =
            await this.getToken();

        const response =
            await fetch(
                `${this.baseUrl}/sync/push`,
                {
                    method: "POST",
                    credentials: "include",

                    body: JSON.stringify({
                        events,
                    }),
                }
            );

        if (!response.ok) {
            throw new Error(
                `Sync push failed: ${response.status}`
            );
        }

        return await response.json();
    }


    async pull(
        cursor: number,
        limit = 100
    ): Promise<SyncPullResult> {

        const token =
            await this.getToken();

        const response =
            await fetch(
                `${this.baseUrl}/sync/pull?cursor=${cursor}&limit=${limit}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                    },
                }
            );

        if (!response.ok) {
            throw new Error(
                `Sync pull failed: ${response.status}`
            );
        }

        return await response.json();
    }
}