import {
    BackendEventPayload,
    SyncPushResult,
    SyncPullResult,
    SyncTransport,
} from "./types";

import { apiFetch } from "@/lib/api";

export class HttpSyncTransport
    implements SyncTransport {

    constructor(
        private readonly baseUrl: string
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

        const response = await apiFetch(
                    `${this.baseUrl}/sync/push`,
                    {
                        method: "POST",

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
        const response =
            await apiFetch(
                `${this.baseUrl}/sync/pull?cursor=${cursor}&limit=${limit}`,
                {
                    method: "GET"
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