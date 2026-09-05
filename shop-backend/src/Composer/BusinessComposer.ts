import { Router } from "express";

import { RepositoryRegistry } from "../modules/sync/repositories/RepositoryRegistry.js";
import { ProjectionEventBus } from "@business/event-bus";
import { EventValidator } from "../modules/sync/service/EventValidator.js";
import { createSyncRouter } from "../routes/sync.route.js";

import { SalesConsumer } from "../modules/sync/projection/salesConsumer.js";
import { BranchConsumer } from "../modules/sync/projection/branchConsumer.js";
import { BusinessConsumer } from "../modules/sync/projection/businessConsumer.js";
import { ProductConsumer } from "../modules/sync/projection/productConsumer.js";
import { InventoryConsumer } from "../modules/sync/projection/inventoryConsumer.js";
import { LedgerConsumer } from "../modules/sync/projection/ledgerConsumer.js";

export interface SyncModule {
    router: Router;
    repositories: RepositoryRegistry;
    projectionBus: ProjectionEventBus;
}

export class BusinessComposer {

    async boot(): Promise<SyncModule> {

        const repositories =
            new RepositoryRegistry();

        const eventValidator =
            new EventValidator();

        const projectionBus =
            new ProjectionEventBus();

        // Register projections
        projectionBus.subscribe(
            new BusinessConsumer(
                repositories.business
            )
        );

        projectionBus.subscribe(
            new BranchConsumer(
                repositories.branch
            )
        );

        projectionBus.subscribe(
            new ProductConsumer(
                repositories.products
            )
        );

        projectionBus.subscribe(
            new InventoryConsumer(
                repositories.inventory
            )
        );

        projectionBus.subscribe(
            new SalesConsumer(
                repositories.sales
            )
        );

        projectionBus.subscribe(
            new LedgerConsumer(
                repositories.ledger
            )
        );

        // Compose Sync module
        const router =
            createSyncRouter(
                repositories,
                eventValidator
            );

        return {
            router,
            repositories,
            projectionBus
        }
    }
}