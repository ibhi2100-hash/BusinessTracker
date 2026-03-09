import { Router } from "express";
import { LiabilityController } from "../modules/liability/controller/liability.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { CashflowRepository } from "../modules/cashflow/repository/cashflow.repository.js";
import { LiabilityRepository } from "../modules/liability/repository/liability.repository.js";
import { LiabilityService } from "../modules/liability/service/liability.service.js";

const router = Router();
const cashflowRepo = new CashflowRepository();
const liabilityRepo = new LiabilityRepository();
const liabilityService = new LiabilityService(liabilityRepo, cashflowRepo);
const controller = new LiabilityController(liabilityService); 


router.use(authMiddleware, isAdminMiddleware);

router.post("/", controller.create);
router.get("/", controller.list);
router.post("/:liabilityId/repay", controller.repay);

export default router;
