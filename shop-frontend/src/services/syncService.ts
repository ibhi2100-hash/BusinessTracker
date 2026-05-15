import { getDb }
  from "@/src/db";

import { useAuthStore }
  from "../store/useAuthStore";

import { rebaseAggregate }
  from "@/offline/core/events/rebase/rebaseAggregate";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

let syncing = false;

export const syncService = {

  async sync() {

    if (syncing) {
      return;
    }

    syncing = true;

    try {

      const userId =
        useAuthStore
          .getState()
          .user?.id;

      const db =
        getDb(userId);

      if (!db) {
        return;
      }

      /* -----------------------------------
         LOAD PENDING EVENTS
      ----------------------------------- */

      const pendingEvents =
        await db.events
          .where("status")
          .equals("PENDING")
          .sortBy("logicClock");

      if (!pendingEvents.length) {
        return;
      }

      /* -----------------------------------
         GROUP BY AGGREGATE
      ----------------------------------- */

      const grouped =
        groupEventsByAggregate(
          pendingEvents
        );

      /* -----------------------------------
         SYNC EACH AGGREGATE
      ----------------------------------- */

      for (const group of grouped) {

        await this.syncAggregate(
          db,
          group
        );
      }

    } finally {

      syncing = false;
    }
  },

  /* -----------------------------------
     SYNC SINGLE AGGREGATE
  ----------------------------------- */

  async syncAggregate(
    db,
    events
  ) {

    try {

      const response =
        await fetch(
          `${API_URL}/sync`,
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(events),
          }
        );

      if (!response.ok) {

        throw new Error(
          `HTTP_${response.status}`
        );
      }

      const result =
        await response.json();

      await this.applySyncResult(
        db,
        result
      );

    } catch (error) {

      console.error(
        "SYNC_FAILED",
        error
      );
    }
  },

  /* -----------------------------------
     APPLY SERVER RESULT
  ----------------------------------- */

  async applySyncResult(
    db,
    result
  ) {

    const success =
      result.success ?? [];

    const failed =
      result.failed ?? [];

    const conflicts =
      result.conflicts ?? [];

    await db.transaction(

      "rw",

      db.events,
      db.aggregates,

      async () => {

        /* -----------------------------
           APPLY SUCCESS
        ----------------------------- */

        for (const item of success) {

          await db.events.update(
            item.eventId,
            {
              synced: true,
              status: "SYNCED",
            }
          );

          /* -------------------------
             UPDATE LOCAL VERSION
          ------------------------- */

          const aggregate =
            await db.aggregates
              .where(
                "[aggregateType+aggregateId]"
              )
              .equals([
                item.aggregateType,
                item.aggregateId
              ])
              .first();

          if (aggregate) {

            await db.aggregates.update(
              aggregate.id,
              {
                version:
                  item.aggregateVersion,
              }
            );
          }
        }

        /* -----------------------------
           APPLY FAILED
        ----------------------------- */

        for (const item of failed) {

          await db.events.update(
            item.eventId,
            {
              status: "FAILED",
            }
          );
        }
      }
    );

    /* -----------------------------------
       HANDLE CONFLICTS
    ----------------------------------- */

    for (const conflict of conflicts) {

      await this.handleConflict(
        db,
        conflict
      );
    }
  },

  /* -----------------------------------
     CONFLICT REBASE
  ----------------------------------- */

  async handleConflict(
    db,
    conflict
  ) {

    console.warn(
      "REBASING",
      conflict.aggregateId
    );

    /* -----------------------------------
       LOAD LOCAL PENDING EVENTS
    ----------------------------------- */

    const pending =
      await db.events
        .where(
          "[aggregateType+aggregateId]"
        )
        .equals([
          conflict.aggregateType,
          conflict.aggregateId
        ])
        .filter(
          x =>
            x.status === "PENDING"
        )
        .sortBy("logicClock");

    /* -----------------------------------
       REBASE
    ----------------------------------- */

    await rebaseAggregate(
      db,
      {

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
      }
    );

    /* -----------------------------------
       RETRY SYNC
    ----------------------------------- */

    await this.sync();
  },
};

/* ---------------------------------------
   GROUP EVENTS
--------------------------------------- */

function groupEventsByAggregate(
  events
) {

  const map =
    new Map();

  for (const event of events) {

    const key =
      `${event.aggregateType}:${event.aggregateId}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key).push(event);
  }

  return Array.from(
    map.values()
  );
}