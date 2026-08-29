import { Router } from "express";
import { OfflineSyncController } from "../modules/sync/controller/SyncController.js";
import { OfflineSyncService } from "../modules/sync/service/SyncService.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { RepositoryRegistry } from "../modules/sync/repositories/RepositoryRegistry.js";




const repositories = new RepositoryRegistry();
const offlineSyncService = new OfflineSyncService(repositories);
const offlineSyncController = new OfflineSyncController(offlineSyncService);

const router = Router();

router.post('/push', authMiddleware,  offlineSyncController.pushEvent.bind(offlineSyncController));
router.get('/pull', authMiddleware, offlineSyncController.getAggregateEvents.bind(offlineSyncController));


export default router; 