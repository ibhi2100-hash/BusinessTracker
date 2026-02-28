import express from 'express';
import { SaleController } from '../modules/sales/controller/sale.controller.js';
import { requireBusiness } from '../middlwares/helpers.middlewares.js';
import { authMiddleware } from '../middlwares/auth.middleware.js';
import { SaleRepository } from '../modules/sales/repository/sale.repository.js';
import { SaleService } from '../modules/sales/service/sale.service.js';
import { inventoryRepository } from '../modules/inventory/repository/inventory.repository.js';
import { InventoryService } from '../modules/inventory/service/inventory.service.js';
import { AlertRepository } from '../modules/alerts/repository/alerts.repository.js';
import { AlertService } from '../modules/alerts/service/alerts.service.js';

const saleRepo = new SaleRepository();
const alertRepo = new AlertRepository();
const alertService = new AlertService(alertRepo);
const inventoryService = new InventoryService
const saleService = new SaleService(saleRepo, inventoryService, alertService);
const saleController = new SaleController(saleService);

const router = express.Router();

/*====================================================================================================================
                                               Create Sales
=====================================================================================================================*/

router.post('/', authMiddleware, requireBusiness, saleController.createSale.bind(saleController))

/*====================================================================================================================
                                               Refund Sale
=====================================================================================================================-*/

router.post('/refund', authMiddleware, requireBusiness, saleController.refundSale.bind(saleController))


export default router;