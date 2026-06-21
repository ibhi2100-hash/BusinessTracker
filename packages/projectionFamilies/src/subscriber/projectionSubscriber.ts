import { EventSubscriber } from "@business/event-bus"
import { IntegrationEvent } from "@business/shared-types"
import { OperationalProjectionEngine } from "../operational/engine/OperationalProjectionEngine"

export class ProjectionSubscriber implements EventSubscriber<IntegrationEvent> {
    constructor(
        private readonly projecionEngine: OperationalProjectionEngine
    ){}
    async handle(events: IntegrationEvent[]): Promise<void> {
        for (const event of events) {
            await this.projecionEngine.process(event)
        }
    }
}
