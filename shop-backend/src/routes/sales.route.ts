import express from 'express';
import { SaleController } from '../modules/sales/controller/sale.controller.js';
import { requireBusiness } from '../middlwares/helpers.middlewares.js';
import { authMiddleware } from '../middlwares/auth.middleware.js';


const router = express.Router();

/*====================================================================================================================
                                               Create Sales
=====================================================================================================================*/

router.post('/', authMiddleware, requireBusiness, SaleController.prototype.createSale.bind(new SaleController()))

/*====================================================================================================================
                                               Refund Sale
=====================================================================================================================-*/

router.post('/refund', authMiddleware, requireBusiness, SaleController.prototype.refundSale.bind(new SaleController))


export default router;