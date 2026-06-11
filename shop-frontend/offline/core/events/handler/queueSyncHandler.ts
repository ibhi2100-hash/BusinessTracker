import { BaseEvent } from "@business/shared-types";
import { queueSync } from "../../../../src/sync/syncQueue";

export async function queueSyncHandler(
  event: BaseEvent
) {

  await queueSync();
}