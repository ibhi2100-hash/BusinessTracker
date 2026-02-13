import express from 'express';
import { ProductController } from '../modules/products/controller/product.controller.js';
import { authMiddleware } from '../middlwares/auth.middleware.js';
import { isAdminMiddleware } from '../middlwares/isAdmin.middleware.js';
import { requireBusiness } from '../middlwares/helpers.middlewares.js';

const router = express.Router();

/*========================================================
        Create Product - Admins with Business ID Only
=========================================================*/

router.post('/create',
    authMiddleware,
    isAdminMiddleware,
    requireBusiness,
    ProductController.prototype.createProduct.bind(new ProductController())
)

/*========================================================
        Get Products - Admins with Business ID Only
=========================================================*/
router.get('/',
    authMiddleware,
    isAdminMiddleware,
    requireBusiness,
    ProductController.prototype.getProducts.bind(new ProductController())
)
/*========================================================
        Delete Product - Admins with Business ID Only
=========================================================*/
router.delete('/:id',
    authMiddleware,
    isAdminMiddleware,
    requireBusiness,
    ProductController.prototype.deleteProduct.bind(new ProductController())
)
/*========================================================
        Get Category - Admins with Business ID Only
=========================================================*/
router.get('/category/:id',
    authMiddleware,
    isAdminMiddleware,
    requireBusiness,
    ProductController.prototype.getCategory.bind(new ProductController())
)
/*========================================================
        Update Product - Admins with Business ID Only
=========================================================*/
router.put('/:id',
    authMiddleware,
    isAdminMiddleware,
    requireBusiness,
    ProductController.prototype.updateProduct.bind(new ProductController())
)


export default router;