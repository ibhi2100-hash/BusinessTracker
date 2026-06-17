import { SyncApi } from "@business/sync";
import { BaseEvent } from "@business/shared-types";
import { SyncResult, AggregateState } from "@business/sync";

export class HttpSyncApi implements SyncApi {

  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  async syncAggregate(
    aggregateId: string,
    aggregateType: string,
    baseVersion: number,
    events: BaseEvent[]
  ): Promise<SyncResult> {

    const res = await fetch(
      `${this.baseUrl}/sync`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            aggregateId,
            aggregateType,
            baseVersion,
            events 
        })
      }
    );

    if (!res.ok) throw new Error("Sync failed");

    return res.json();
  }

  async getAggregateState(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateState | null> {

    const res = await fetch(
      `${this.baseUrl}/events/aggregate-state`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          aggregateId,
          aggregateType
        })
      }
    );

    if (res.status === 404) return null;

    if (!res.ok) throw new Error("Failed to load state");

    return res.json();
  }

  async getEventsSince(
    globalPosition: bigint
  ): Promise<BaseEvent[]> {

    const res = await fetch(
      `${this.baseUrl}/events/since/${globalPosition.toString()}`,
      {
        credentials: "include"
      }
    );

    if (!res.ok) throw new Error("Failed to load events");

    return res.json();
  }
}