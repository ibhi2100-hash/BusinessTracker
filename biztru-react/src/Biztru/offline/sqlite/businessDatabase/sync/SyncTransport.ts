import type{
    BackendEventPayload,
    SyncPushResult,
    SyncPullResult
} from "@business/shared-types";

import { apiFetch } from "../../../../../lib/api"; 

export class HttpSyncTransport{
    private readonly baseUrl: string
    constructor(
        baseUrl: string
    ) {
        this.baseUrl = baseUrl
    }

    async push(
        events: BackendEventPayload[]
    ): Promise<SyncPushResult> {

        if (events.length === 0) {
            return {
                accepted: [],
                conflicts: [],
                rejected: [],
                summary: {
                    accepted: 0,
                    alreadyAccepted: 0,
                    conflicts: 0,
                    rejected: 0,
                    total: 0,
                },
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

        const result =
            await response.json() as SyncPushResult;

        return result;
    }


    async pull(
        businessId: string,
        cursor: string,
        limit = 100,
        ): Promise<SyncPullResult> {
        if (!businessId.trim()) {
            throw new Error("Sync pull requires a businessId.");
        }

        if (!/^\d+$/.test(cursor)) {
            throw new Error(`Invalid sync cursor: ${cursor}`);
        }

        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500) {
            throw new Error("Pull limit must be between 1 and 500.");
        }

        const params = new URLSearchParams({
  businessId,
  cursor,
  limit: String(limit),
});

const url = `${this.baseUrl}/sync/pull?${params.toString()}`;

console.log("[HttpSyncTransport] Pull arguments:", {
  businessId,
  cursor,
  cursorType: typeof cursor,
  limit,
});

console.log("[HttpSyncTransport] Final URL:", url);

const response = await apiFetch(url, { method: "GET" });

        if (!response.ok) {
            throw new Error(`Sync pull failed: ${response.status}`);
        }

        const result: unknown = await response.json();

        if (
            typeof result !== "object" ||
            result === null ||
            !("businessId" in result) ||
            result.businessId !== businessId ||
            !("events" in result) ||
            !Array.isArray(result.events) ||
            !("cursor" in result) ||
            typeof result.cursor !== "string" ||
            !/^\d+$/.test(result.cursor) ||
            !("hasMore" in result) ||
            typeof result.hasMore !== "boolean"
        ) {
            throw new Error("Invalid or mismatched sync pull response.");
        }

        if (BigInt(result.cursor) < BigInt(cursor)) {
            throw new Error("Server returned a cursor older than requested.");
        }

        if (result.events.length > limit) {
            throw new Error("Server returned more events than requested.");
        }

        if (result.events.length === 0 && result.hasMore) {
            throw new Error("Invalid pull response: hasMore without events.");
        }

        return result as SyncPullResult;
        }
        
}