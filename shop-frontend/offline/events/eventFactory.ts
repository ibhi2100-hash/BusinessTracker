import { EventType } from "./eventTypes"

export const createEvent = (type: string, payload: any)=> {
    return {
        id: crypto.randomUUID(),
        type,
        payload,
        timestamp: Date.now(),
        synced: false
    }
}