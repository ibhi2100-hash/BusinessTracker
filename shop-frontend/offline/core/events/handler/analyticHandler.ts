import { BaseEvent } from "@/offline/core/events/types";


export async function analyticsHandler(
  event: BaseEvent
) {

  analytics.track(
    event.type,
    event.payload
  );
}