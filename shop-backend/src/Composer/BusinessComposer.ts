import { Router } from "express";

import { RepositoryRegistry } from "../modules/sync/repositories/RepositoryRegistry.js";
import { ProjectionEventBus } from "../buses/ProjectionEventBus.js";
import { EventValidator } from "../modules/sync/service/EventValidator.js";
import { createSyncRouter } from "../routes/sync.route.js";

import { SalesConsumer } from "../modules/sync/projection/salesConsumer.js";
import { BranchConsumer } from "../modules/sync/projection/branchConsumer.js";
import { BusinessConsumer } from "../modules/sync/projection/businessConsumer.js";
import { ProductConsumer } from "../modules/sync/projection/productConsumer.js";
import { InventoryConsumer } from "../modules/sync/projection/inventoryConsumer.js";
import { LedgerConsumer } from "../modules/sync/projection/ledgerConsumer.js";
import { ProjectionWorker } from "../modules/sync/projection/ProjectionWorker.js"
import { ExpenseConsumer } from "../modules/sync/projection/expenseConsumer.js";
import { UserConsumer } from "../modules/sync/projection/userConsumer.js";
import { EmployeeInvitationConsumer } from "../modules/sync/projection/employee/employeeInvitation.js";
import { EmployeeInvitationIssuanceService } from "../modules/employeeInvitations/service/EmployeeInvitationIssuanceService.js";
import { EmployeeConsumer } from "../modules/sync/projection/employee/EmployeeConsumer.js";

export interface SyncModule {
    router: Router;
    repositories: RepositoryRegistry;
    projectionBus: ProjectionEventBus;
    projectionWorker: ProjectionWorker;
}

export class BusinessComposer {

    async boot(): Promise<SyncModule> {

        const repositories =
            new RepositoryRegistry();
        const invitationIssuanceService = new EmployeeInvitationIssuanceService()
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
            new ExpenseConsumer(
                repositories.expense
            )
        )

        projectionBus.subscribe(
            new LedgerConsumer(
                repositories.ledger
            )
        );

        projectionBus.subscribe(
            new UserConsumer(
                repositories.user
            )
        )

         projectionBus.subscribe(
            new EmployeeConsumer(
                repositories.employees
            )
        )
        projectionBus.subscribe(
            new EmployeeInvitationConsumer(
                invitationIssuanceService
            )
        )

        projectionBus.subscribe(
            new EmployeeConsumer(
                repositories.employees
            )
        )


        const projectionWorker = 
            new ProjectionWorker(
                repositories,
                projectionBus
            )

        // Compose Sync module
        const router =
            createSyncRouter(
                repositories,
                eventValidator
            );

        return {
            router,
            repositories,
            projectionBus,
            projectionWorker
        }
    }
}