import { BaseEvent } from "@business/shared-types";
const analytics =  {
  async track(eventType: string, payload: any){
    console.log("i am analytic")
  }
}

export async function analyticsHandler(
  event: BaseEvent
) {

  analytics.track(
    event.type,
    event.payload
  );
}