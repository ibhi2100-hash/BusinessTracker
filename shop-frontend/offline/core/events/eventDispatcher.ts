import { queueSync } from "@/src/sync/syncQueue";
import { validateEvent }from "./validationEngine";
import { BaseEvent } from "@business/shared-types"
import { StorageEngine } from "@/src/offline/sqlite/businessDatabase/engine/StorageEngine";
import { createFrontendEventEngine } from "../eventEngine/createEventEngine";

export const dispatchEvent =
  async (
    event: BaseEvent
    
  ) => {

    validateEvent(event);
    console.log("this is the event inside pipeline: ", event)

    const tx =
      new StorageEngine();

      await tx.transaction(async() => {
        const eventpipeline = createFrontendEventEngine()
        const pipeline = eventpipeline.pipeline

        await pipeline.append(event)
      })
    /* --------------------------------
       SIDE EFFECTS AFTER COMMIT
    -------------------------------- */
    /* --------------------------------
       QUEUE SYNC
    -------------------------------- */
    queueSync();
};