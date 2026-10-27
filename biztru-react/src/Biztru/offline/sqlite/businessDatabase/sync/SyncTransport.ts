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
  limit = 100
): Promise<SyncPullResult> {
  const params = new URLSearchParams({
    businessId,
    cursor,
    limit: String(limit),
  });

  const response = await apiFetch(
    `${this.baseUrl}/sync/pull?${params}`,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error(
      `Sync pull failed: ${response.status}`
    );
  }

  return await response.json() as SyncPullResult;
}
}