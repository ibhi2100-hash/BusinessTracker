import { Router } from "express";
import { CashflowController } from "../modules/cashflow/controller/cashflow.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { CashflowRepository } from "../modules/cashflow/repository/cashflow.repository.js";
import { CashflowService } from "../modules/cashflow/service/cashflow.service.js";

const router = Router();
const repo = new CashflowRepository();
const service = new CashflowService(repo);
const controller = new CashflowController(service);

router.use(authMiddleware, isAdminMiddleware);

// Branch opening cash
router.post("/opening", controller.addOpeningCash.bind(controller));

// Owner cash top-up
router.post("/inject", controller.injectCash.bind(controller));

// Owner cash withdrawal
router.post("/withdraw", controller.withdrawCash.bind(controller));

// Get all cashflow records for the branch
router.get("/", controller.getCashflowRecord.bind(controller));

// Get daily summary
router.get("/dailySummary", controller.getDailySummary.bind(controller));

export default router;