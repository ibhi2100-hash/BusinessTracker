import  express from 'express';
import { AssetController } from '../modules/assets/controller/asset.controller.js';
import { isAdminMiddleware } from '../middlwares/isAdmin.middleware.js';
import { authMiddleware } from '../middlwares/auth.middleware.js';
import { requireBusiness } from '../middlwares/helpers.middlewares.js';


const router = express.Router();

const controller = new AssetController();

// middlewares
router.use(authMiddleware, isAdminMiddleware, requireBusiness)

router.post('/', controller.createAsset);
router.get('/', controller.list);
router.post('/:assetId/dispose', controller.dispose)

export default router