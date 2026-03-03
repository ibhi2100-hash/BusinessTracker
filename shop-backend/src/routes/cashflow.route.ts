import { Router } from "express";
import { CashflowController } from "../modules/cashflow/controller/cashflow.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { CashflowRepository } from "../modules/cashflow/repository/cashflow.repository.js";
import { CashflowService } from "../modules/cashflow/service/cashflow.service.js";

const router = Router();
const repo = new CashflowRepository();
const service = new CashflowService(repo)
const controller = new CashflowController(service);

router.use(authMiddleware, isAdminMiddleware)

//Get injected capital record
router.get("/", controller.getCashflowRecord)

// Owner Cash Injection
router.post("/inject", controller.addOpeningCash.bind(controller));

// Owner Cash Withdrawal
router.post("/withdraw", controller.withdrawCash.bind(controller));

//get Daily summary 
router.get("/dailySummary", controller.getDailySummary.bind(controller))

export default router;