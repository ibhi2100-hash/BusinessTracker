import { AppDB, getDb } from "@/src/db";
import { useAuthStore } from "../store/useAuthStore";
import { rebaseAggregate } from "@/offline/core/events/rebase/rebaseAggregate";
import { calculateRetryDelay } from "../helpers/retryDelay";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let syncing = false;

export const syncService = {
  async sync() {
    if (syncing) return;
    syncing = true;

    try {
      const userId = useAuthStore.getState().user?.id;
      const db = getDb(userId);
      if (!db) return;
      const now = Date.now();

      

      const pending = await db.events
        .where("status")
        .equals("PENDING")
        .toArray()
    
      const failed =
        await db.events
          .where("status")
          .equals("FAILED")
          .filter(event => {
            if(
              (event.retryCount ?? 0) >= 10
            ){
              return false
            }

            return (
              !event.nextRetryAt ||
              event.nextRetryAt <= now
            );
          })
          .toArray()
     const pendingEvents = [
        ...pending,
        ...failed
     ].sort(
        (a, b) =>
          a.logicClock - b.logicClock
     )
console.log(" This is are the pending events that remain: ", pendingEvents)
      const grouped = groupEventsByAggregate(pendingEvents);

      for (const group of grouped) {
        await this.syncAggregate(db, group);
      }
    } finally {
      syncing = false;
    }
  },

  async syncAggregate(db: AppDB, events: any[]) {
    const first = events[0];

    const aggregateId = first.aggregateId;
    const aggregateType = first.aggregateType;

    // LOCAL BASE VERSION (optimistic)

    const lastEvent = await db.events
      .where("[aggregateType+aggregateId]")
      .equals([aggregateType, aggregateId])
      .filter(x => x.status === "SYNCED")
      .last() 

    const baseVersion = lastEvent?.aggregateVersion ?? 0;

    const response = await fetch(`${API_URL}/sync`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aggregateId,
        aggregateType,
        baseVersion,
        events,
      }),
    });

    if (!response.ok) {
      throw new Error(`SYNC_HTTP_${response.status}`);
    }

    const result = await response.json();

    await this.applySyncResult(db, result, aggregateId, aggregateType);
  },

  async applySyncResult(
    db: any,
    result: any,
    aggregateId: string,
    aggregateType: string
  ) {
    const { success = [], failed = [], conflicts = [], serverState } = result;

    await db.transaction("rw", db.events, db.aggregates, async () => {
      // 1. mark synced events
      for (const item of success) {
        await db.events.update(item.eventId, {
          aggregateVersion: item.aggregateVersion,
          synced: true,
          status: "SYNCED",
        });
      }

      // 2. authoritative aggregate update (SERVER WINS)
      if (serverState) {
        const key = `${aggregateType}:${aggregateId}`;

        await db.aggregates.put({
          id: key,
          aggregateId,
          aggregateType,
          version: serverState.version,
          lastGlobalPosition: serverState.lastGlobalPosition,
          lastSnapshotVersion: serverState.lastSnapshotVersion,
        });
      }

      // 3. failed events
      for (const item of failed) {
      
        const current = await db.events.get(item.eventId);
        if (!current) continue;
        if (current.status === "SYNCED") continue; // already marked by another sync process
        const retryCount = (current.retryCount ?? 0) + 1;
        const dead = 
          retryCount >= 10;
          
        const delay = calculateRetryDelay(retryCount)
        
        await db.events.update(item.eventId, {
          status: dead ? "DEAD" : "FAILED",
          retryCount,
          lastRetryAt: Date.now(),
          nextRetryAt:
            dead ? undefined : Date.now() + delay,
          lastError: item.error ?? "SYNC_FAILED",
        });
      }
    });

    // 4. conflicts → rebase
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        await this.handleConflict(db, conflict);
      }
    }
  },

  async handleConflict(db: any, conflict: any) {
    console.warn("REBASING AGGREGATE:", conflict.aggregateId);

    const pending = await db.events
      .where("[aggregateType+aggregateId]")
      .equals([conflict.aggregateType, conflict.aggregateId])
      .filter((x: any) => x.status === "PENDING")
      .sortBy("logicClock");

    await rebaseAggregate(db, {
      aggregateId: conflict.aggregateId,
      aggregateType: conflict.aggregateType,
      serverVersion: conflict.serverVersion,
      serverSnapshot: conflict.snapshot,
      serverEvents: conflict.serverEvents,
      pendingEvents: pending,
    });

    await this.sync();
  },
};

function groupEventsByAggregate(events: any[]) {
  const map = new Map<string, any[]>();

  for (const event of events) {
    const key = `${event.aggregateType}:${event.aggregateId}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(event);
  }

  return Array.from(map.values());
}