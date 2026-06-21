import { PrismaLedgerRepo } from "../repository/PrismaLedgerRepo.js";
import { InMemoryEventBus } from "@business/event-bus";
import { CanonicalEvent, IntegrationEvent } from "@business/shared-types";
import { CreateProjectionEngine } from "../projectionEngine/projectionEngine.js"
import { CanonicalMapper } from "../../../lib/canonicalEventMapper.js";
import { EventPipeline } from "@business/events";
import { ProjectionSubscriber } from "@business/projection-families";
import { LedgerSubscriber } from "@business/ledger-engine";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { createBackendLedgerEngine } from "../../../infrastructure/ledger/backendLedgerEngine.js";
import { PrismaEventRepository } from "../repository/PrismaEventRepository.js";


export function creatBackendEventEngine(
    tx: Prisma.TransactionClient
){
    const bus = new InMemoryEventBus<IntegrationEvent>();

    const repo = new PrismaEventRepository(tx);

    const mapper = new CanonicalMapper()

    const projectionEngine = CreateProjectionEngine(tx);
    const ledgerEngine = createBackendLedgerEngine(tx);

    const projectionSubscriber = 
        new ProjectionSubscriber(projectionEngine);

    const ledgerSubscriber = 
        new LedgerSubscriber(ledgerEngine)

    bus.subscribe(projectionSubscriber);
    bus.subscribe(ledgerSubscriber)
    const pipeline = new EventPipeline<
        CanonicalEvent,
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