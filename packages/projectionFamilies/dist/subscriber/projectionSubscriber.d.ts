import { EventSubscriber } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";
import { ProjectionEngine } from "../contracts/projectionEngine";
export declare class ProjectionSubscriber implements EventSubscriber<DomainEvent> {
    private readonly engine;
    constructor(engine: ProjectionEngine<DomainEvent>);
    handle(events: DomainEvent<unknown>[]): Promise<void>;
}
