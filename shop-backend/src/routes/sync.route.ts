import { Router } from "express";
import { OfflineSyncService } from "../modules/offlineSync/service/offlineSync.service.js";
import { OfflineSyncController } from "../modules/offlineSync/controller/offlineSync.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { SyncRepository } from "../modules/offlineSync/repository/syncRepository.js";
import { LedgerRepository } from "../modules/ledger/ledgerRepository.js";


const syncedRepo = new SyncRepository();
const ledgerRepo = new LedgerRepository();
const offlineSyncService = new OfflineSyncService(syncedRepo, ledgerRepo);
const offlineSyncController = new OfflineSyncController(offlineSyncService);

const router = Router();

router.post('/', authMiddleware,  offlineSyncController.sync.bind(offlineSyncController));
router.get('/event', authMiddleware, offlineSyncController.getAggregateEvents.bind(offlineSyncController));


export default router; 