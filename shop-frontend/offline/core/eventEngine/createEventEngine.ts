import { BaseEventMapper } from "@/src/mappers/BaseEventMapper";
import { InMemoryEventBus } from "@business/event-bus";
import { BaseEvent, IntegrationEvent } from "@business/shared-types";
import { CreateProjectionEngine } from "../events/projectors/projectEngine";
import { SQLiteEventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";
import { LedgerEngine } from "@business/ledger-engine";
import { createFrontendLedgerEngine } from "../LedgerEngine";
import { StorageClient } from "@/src/offline/sqlite/bus/StorageBus"
import { EventPipeline } from "@business/events";
import { ProjectionSubscriber } from "@business/projection-families";
import { LedgerSubscriber } from "@business/ledger-engine";

export function createFrontendEventEngine(
){
    const bus = new InMemoryEventBus<IntegrationEvent>();
    const storage = new StorageClient()
    const repo = new SQLiteEventRepository(storage);

    const mapper = new BaseEventMapper();

    const projectionEngine = CreateProjectionEngine();
    const ledgerEngine = createFrontendLedgerEngine();

    const projectionSubscriber = 
        new ProjectionSubscriber(projectionEngine);

    const ledgerSubscriber = 
        new LedgerSubscriber(ledgerEngine)

    bus.subscribe(projectionSubscriber);
    bus.subscribe(ledgerSubscriber)
    const pipeline = new EventPipeline<
        BaseEvent,
        IntegrationEvent
    >(
        repo,
        mapper,
        bus
    );

    return {
        pipeline,
        bus,
        repo,
        projectionEngine,
        ledgerEngine,
    }
}