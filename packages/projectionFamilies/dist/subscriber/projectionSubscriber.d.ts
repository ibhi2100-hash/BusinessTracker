import { EventSubscriber } from "@business/event-bus";
import { IntegrationEvent } from "@business/shared-types";
import { OperationalProjectionEngine } from "../operational/engine/OperationalProjectionEngine";
export declare class ProjectionSubscriber implements EventSubscriber<IntegrationEvent> {
    private readonly projecionEngine;
    constructor(projecionEngine: OperationalProjectionEngine);
    handle(events: IntegrationEvent[]): Promise<void>;
}
