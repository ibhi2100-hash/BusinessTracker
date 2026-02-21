import express from 'express';
import { ProductController } from '../modules/products/controller/product.controller.js';
import { authMiddleware } from '../middlwares/auth.middleware.js';
import { isAdminMiddleware } from '../middlwares/isAdmin.middleware.js';
import { requireBusiness } from '../middlwares/helpers.middlewares.js';
import { CashflowRepository } from '../modules/cashflow/repository/cashflow.repository.js';
import { InventoryService } from '../modules/inventory/service/inventory.service.js';
import { inventoryRepository } from '../modules/inventory/repository/inventory.repository.js';
import { ProductRepository } from '../modules/products/repository/product.repository.js';
import { ProductService } from '../modules/products/service/product.service.js';
import { join } from 'node:path';

const router = express.Router();

// Instances 
const cashflowRepo = new CashflowRepository();
const inventoryRep = new inventoryRepository();
const productRepo = new ProductRepository();
const productService = new ProductService(productRepo,cashflowRepo, inventoryRep );
const productController = new ProductController(productService)

/*========================================================
        Create Product - Admins with Business ID Only
=========================================================*/

router.post(
  '/create',
  authMiddleware,
  isAdminMiddleware,
  requireBusiness,
  productController.createProduct.bind(productController)
);

/*========================================================
        Get Products - Admins with Business ID Only
=========================================================*/
router.get(
  '/',
  authMiddleware,
  isAdminMiddleware,
  requireBusiness,
  productController.getProducts.bind(productController)
)
/*========================================================
        Get Products For A Branch under a specific branch
==========================================================*/
router.get('/brands', authMiddleware, requireBusiness, productController.getProductsForBrand.bind(productController))


/*=======================================================
        Delete Product - Admins with Business ID Only
=========================================================*/
router.delete(
  '/:id',
  authMiddleware,
  isAdminMiddleware,
  requireBusiness,
  productController.deleteProduct.bind(productController)
);
/*========================================================
        Get Category - Admins with Business ID Only
=========================================================*/
router.get(
  '/category/:id',
  authMiddleware,
  isAdminMiddleware,
  requireBusiness,
  productController.getCategory.bind(productController)
);
/*========================================================
        Update Product - Admins with Business ID Only
=========================================================*/
router.put(
  '/:id',
  authMiddleware,
  isAdminMiddleware,
  requireBusiness,
  productController.updateProduct.bind(productController)
);

export default router;