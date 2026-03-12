import { Router } from "express";
import { inventoryRepository } from "../modules/inventory/repository/inventory.repository.js";
import { InventoryService } from "../modules/inventory/service/inventory.service.js";
import { AlertService } from "../modules/alerts/service/alerts.service.js";
import { SaleRepository } from "../modules/sales/repository/sale.repository.js";
import { SaleService } from "../modules/sales/service/sale.service.js";
import { ProductRepository } from "../modules/products/repository/product.repository.js";
import { ProductService } from "../modules/products/service/product.service.js";
import { AssetRepository } from "../modules/assets/repository/asset.repository.js";
import { AssetService } from "../modules/assets/service/asset.service.js";
import { LiabilityRepository } from "../modules/liability/repository/liability.repository.js";
import { LiabilityService } from "../modules/liability/service/liability.service.js";
import { AlertRepository } from "../modules/alerts/repository/alerts.repository.js";
import { CashflowRepository } from "../modules/cashflow/repository/cashflow.repository.js";
import { OfflineSyncService } from "../modules/offlineSync/service/offlineSync.service.js";
import { OfflineSyncController } from "../modules/offlineSync/controller/offlineSync.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { requireBusiness } from "../middlwares/helpers.middlewares.js";
import { requireBranch } from "../middlwares/requireBranch.middleware.js";

const saleRepo = new SaleRepository();
const inventoryRepo = new inventoryRepository();
const inventoryService = new InventoryService();
const alertRepo = new AlertRepository()
const alertService = new AlertService(alertRepo)
const saleService = new SaleService(saleRepo, inventoryService, alertService)
const productRepo = new ProductRepository();
const cashflowRepo = new CashflowRepository()
const productService = new ProductService(productRepo, cashflowRepo, inventoryRepo, alertRepo);
const assetRepo = new AssetRepository();
const assetService = new AssetService();
const liabilityRepo = new LiabilityRepository();
const liabilityService = new LiabilityService(liabilityRepo, cashflowRepo)

const offlineSyncService = new OfflineSyncService(saleService, productService, assetService, liabilityService);
const offlineSyncController = new OfflineSyncController(offlineSyncService);

const router = Router();

router.use(authMiddleware, requireBusiness, requireBranch)

router.post('/', offlineSyncController.sync.bind(offlineSyncController))

export default router;