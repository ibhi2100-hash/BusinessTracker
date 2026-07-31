import { InMemoryEventBus, NotificationBus } from "@business/event-bus";

export class FrontEndNotificationBus<TEvent>
extends InMemoryEventBus<TEvent>
implements NotificationBus<TEvent> {
    constructor(){
        super()
    }
}