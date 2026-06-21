import { AppDB } from "@/src/db";
import { BaseEventMapper } from "@/src/mappers/BaseEventMapper";
import { IndexedDbRepository } from "@/src/repositories/EventRepo/IndexedDbEventRepo";
import { InMemoryEventBus } from "@business/event-bus";
import { BaseEvent, IntegrationEvent } from "@business/shared-types";
import { CreateProjectionEngine } from "../events/projectors/projectEngine";
import { LedgerEngine } from "@business/ledger-engine";
import { createFrontendLedgerEngine } from "../LedgerEngine";
import { SnapshotScheduler } from "@business/snapshot-engine";
import { EventPipeline } from "@business/events";
import { ProjectionSubscriber } from "@business/projection-families";
import { LedgerSubscriber } from "@business/ledger-engine";

export function createFrontendEventEngine(
    db: AppDB
){
    const bus = new InMemoryEventBus<IntegrationEvent>();

    const repo = new IndexedDbRepository(db);

    const mapper = new BaseEventMapper();

    const projectionEngine = CreateProjectionEngine(db);
    const ledgerEngine = createFrontendLedgerEngine(db);

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