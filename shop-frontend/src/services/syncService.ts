import Dexie from "dexie"
import { AppDB, getDb } from "@/src/db"
import { useAuthStore } from "../store/useAuthStore"
import { calculateRetryDelay } from "../helpers/retryDelay"
import { groupEventsByAggregate } from "../sync/groupEvents"
import { fetchWithTimeout } from "../sync/fetchWithTimeout"
import { rebaseAggregate } from "../../offline/core/events/rebase/rebaseAggregate"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL

const MAX_RETRY = 10

let syncing = false

export const syncService = {
  async sync() {
    if (syncing) {
      console.log("Sync already running")
      return
    }

    if (!navigator.onLine) {
      console.log("Offline → skipping sync")
      return
    }

    syncing = true

    try {
      const userId = useAuthStore.getState().user?.id

      if (!userId) return

      const db = getDb(userId)

      if (!db) return

      const now = new Date().getTime()

      // PENDING
      const pending =
        await db.events
          .where("status")
          .equals("PENDING")
          .toArray()

      // FAILED eligible for retry
      const failed =
        await db.events
          .where("[nextRetryAt+status]")
          .between(
            ["FAILED", Dexie.minKey],
            ["FAILED", now]
          )
          .toArray()

      const events = [
        ...pending,
        ...failed,
      ].sort((a, b) => {
        if (a.logicClock < b.logicClock) return -1
        if (a.logicClock > b.logicClock) return 1
        return 0
      })

      if (!events.length) {
        console.log("No events to sync")
        return
      }

      const grouped =
        groupEventsByAggregate(events)

      for (const group of grouped) {
        try {
          await this.syncAggregate(
            db,
            group
          )
        } catch (error) {
          console.error(
            "Aggregate sync failed:",
            error
          )

          await this.markAggregateFailed(
            db,
            group,
            error
          )
        }
      }
    } finally {
      syncing = false
    }
  },

  async syncAggregate(
    db: AppDB,
    events: any[]
  ) {
    const first = events[0]

    const aggregateId =
      first.aggregateId

    const aggregateType =
      first.aggregateType

    // Latest synced version
    const synced =
      await db.events
        .where(
          "[aggregateType+aggregateId]"
        )
        .equals([
          aggregateType,
          aggregateId,
        ])
        .filter(
          x => x.status === "SYNCED"
        )
        .sortBy("aggregateVersion")

    const last =
      synced[synced.length - 1]

    const baseVersion =
      last?.aggregateVersion ?? 0

    const response =
      await fetchWithTimeout(
        `${API_URL}/sync`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            aggregateId,
            aggregateType,
            baseVersion,
            events,
          }),
        }
      )

    if (!response.ok) {
      throw new Error(
        `HTTP_${response.status}`
      )
    }

    const result =
      await response.json()

    await this.applySyncResult(
      db,
      result,
      aggregateId,
      aggregateType
    )
  },

  async applySyncResult(
    db: AppDB,
    result: any,
    aggregateId: string,
    aggregateType: string
  ) {
    const {
      success = [],
      failed = [],
      conflicts = [],
      serverState,
    } = result

    await db.transaction(
      "rw",
      db.events,
      db.aggregates,
      async () => {

        // SUCCESS
        for (const item of success) {
          await db.events.update(
            item.eventId,
            {
              status: "SYNCED",
              synced: true,
              aggregateVersion:
                item.aggregateVersion,

              retryCount: 0,
              nextRetryAt: undefined,
              lastError: undefined,
            }
          )
        }

        // SERVER STATE
        if (serverState) {
          await db.aggregates.put({
            id:
              `${aggregateType}:${aggregateId}`,

            aggregateId,
            aggregateType,

            version:
              serverState.version,

            lastEventId:
              serverState.lastEventId,
            
            lastLogicClock:
              serverState.lastLogicClock,

            lastGlobalPosition:
              serverState.lastGlobalPosition,

            lastSnapshotVersion:
              serverState.lastSnapshotVersion,

            updatedAt:
              new Date(),
          })
        }

        // FAILED
        for (const item of failed) {
          const current =
            await db.events.get(
              item.eventId
            )

          if (!current) continue

          if (
            current.status === "SYNCED"
          ) {
            continue
          }

          const retryCount =
            (current.retryCount ?? 0) + 1

          const dead =
            retryCount >= MAX_RETRY

          const delay =
            calculateRetryDelay(
              retryCount
            )

          await db.events.update(
            item.eventId,
            {
              status:
                dead
                  ? "DEAD"
                  : "FAILED",

              retryCount,

              lastRetryAt: Date.now(),

              nextRetryAt:
                dead
                  ? undefined
                  : Date.now() + delay,

              lastError:
                item.error ??
                "SYNC_FAILED",
            }
          )
        }
      }
    )

    // HANDLE CONFLICTS
    for (const conflict of conflicts) {
      await this.handleConflict(
        db,
        conflict
      )
    }
  },

  async handleConflict(
    db: AppDB,
    conflict: any
  ) {
    console.warn(
      "REBASING:",
      conflict.aggregateId
    )

    const pending =
      await db.events
        .where(
          "[aggregateType+aggregateId]"
        )
        .equals([
          conflict.aggregateType,
          conflict.aggregateId,
        ])
        .filter(
          x =>
            x.status === "PENDING"
        )
        .sortBy("logicClock")

    await rebaseAggregate(db, {
      aggregateId:
        conflict.aggregateId,

      aggregateType:
        conflict.aggregateType,

      serverVersion:
        conflict.serverVersion,

      serverSnapshot:
        conflict.snapshot,

      serverEvents:
        conflict.serverEvents,

      pendingEvents:
        pending,
    })
  },

  async markAggregateFailed(
    db: AppDB,
    events: any[],
    error: any
  ) {
    const now = Date.now()

    for (const event of events) {
      const retryCount =
        (event.retryCount ?? 0) + 1

      const dead =
        retryCount >= MAX_RETRY

      const delay =
        calculateRetryDelay(
          retryCount
        )

      await db.events.update(
        event.id,
        {
          status:
            dead
              ? "DEAD"
              : "FAILED",

          retryCount,

          lastRetryAt: Date.now(),

          nextRetryAt:
            dead
              ? undefined
              : Date.now() + delay,

          lastError:
            error?.message ??
            "SYNC_FAILED",
        }
      )
    }
  },
}