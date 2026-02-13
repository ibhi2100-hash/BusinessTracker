import { Router } from "express";
import { ReportController } from "../modules/reports/controller/report.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { requireBusiness } from "../middlwares/helpers.middlewares.js";


const router = Router();
const controller = new ReportController();

router.use(authMiddleware, isAdminMiddleware, requireBusiness);

router.post("/profit-loss", controller.profitAndLoss);
router.post("/cashflow", controller.cashflow);
router.get("/balance-sheet", controller.balanceSheet);
router.post("/summary", controller.summary);

export default router