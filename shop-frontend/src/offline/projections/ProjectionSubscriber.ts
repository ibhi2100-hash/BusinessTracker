import { EventSubscriber } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";

export class PrejectionSubscriber 
implements EventSubscriber<DomainEvent> {
    constructor(
        private readonly engine:
            ProjectionEn
    )
}