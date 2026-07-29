import { EventSubscriber } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";
import { ProjectionEngine } from "../contracts/projectionEngine";

export class ProjectionSubscriber
implements EventSubscriber<DomainEvent> {
    constructor(
        private readonly engine: ProjectionEngine<DomainEvent>
    ){}

    async handle(events: DomainEvent<unknown>[]): Promise<void> {
        for(const event of events) {
            await this.engine.process(event)
        }
    }
}