import { Router } from "express";
import { ReportController } from "../modules/reports/controller/report.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { requireBusiness } from "../middlwares/helpers.middlewares.js";
import { ReportRepository } from "../modules/reports/repository/report.repository.js";
import { ReportService } from "../modules/reports/service/report.service.js";


const router = Router();
const reportRepo = new ReportRepository();
const reportService = new ReportService(reportRepo);
const reportController = new ReportController(reportService)

router.use(authMiddleware, isAdminMiddleware, requireBusiness);

router.get("/profit-loss", reportController.profitAndLoss.bind(reportController));
router.get("/cashflow", reportController.cashflow.bind(reportController));
router.get("/balance-sheet", reportController.balanceSheet.bind(reportController));
router.get("/financial-summary", reportController.summary.bind(reportController));

export default router