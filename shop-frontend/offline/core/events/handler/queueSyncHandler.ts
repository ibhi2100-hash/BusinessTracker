import { BaseEvent } from "../types";
import { queueSync } from "../../../../src/sync/syncQueue";

export async function queueSyncHandler(
  event: BaseEvent
) {

  await queueSync();
}