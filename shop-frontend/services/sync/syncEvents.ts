import { BaseEvent } from "@/offline/events/eventFactory";

export async function syncEvents(events : BaseEvent[]) {
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          
          body: JSON.stringify(events),
        }
    );

    const response = result.json()

    return response
}