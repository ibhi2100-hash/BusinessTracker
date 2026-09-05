import { Router } from "express";

import { OfflineSyncController } from "../modules/sync/controller/SyncController.js";
import { OfflineSyncService } from "../modules/sync/service/SyncService.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { RepositoryRegistry } from "../modules/sync/repositories/RepositoryRegistry.js";
import { ProjectionEventBus } from "@business/event-bus";
import { EventValidator } from "../modules/sync/service/EventValidator.js";

export function createSyncRouter(
    repositories: RepositoryRegistry,
    eventValidator: EventValidator
) {
    const offlineSyncService =
        new OfflineSyncService(
            repositories,
            eventValidator
        );

    const offlineSyncController =
        new OfflineSyncController(
            offlineSyncService
        );

    const router = Router();

    router.post(
        "/push",
        authMiddleware,
        offlineSyncController.pushEvent.bind(
            offlineSyncController
        )
    );

    router.get(
        "/pull",
        authMiddleware,
        offlineSyncController.getAggregateEvents.bind(
            offlineSyncController
        )
    );

    return router;
}