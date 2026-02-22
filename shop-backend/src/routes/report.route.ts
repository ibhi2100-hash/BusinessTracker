import { Router } from "express";
import { ReportController } from "../modules/reports/controller/report.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { requireBusiness } from "../middlwares/helpers.middlewares.js";
import { ReportRepository } from "../modules/reports/repository/report.repository.js";
import { ReportService } from "../modules/reports/service/report.service.js";

const router = Router();

// Initialize repository, service, controller
const reportRepo = new ReportRepository();
const reportService = new ReportService(reportRepo);
const reportController = new ReportController(reportService);

// Apply authentication + admin + business requirement middlewares to all routes
router.use(authMiddleware, isAdminMiddleware, requireBusiness);

// ------------------------
// Report endpoints
// ------------------------

// Profit & Loss report
router.get(
  "/profit-loss",
  reportController.profitAndLoss.bind(reportController)
);

// Cashflow report
router.get(
  "/cashflow",
  reportController.cashflow.bind(reportController)
);

// Balance sheet report
router.get(
  "/balance-sheet",
  reportController.balanceSheet.bind(reportController)
);

// Business financial summary (full report)
router.get(
  "/financial-summary",
  reportController.summary.bind(reportController)
);

// Dashboard summary (quick snapshot)
router.get(
  "/dashboard-summary",
  reportController.dashboardSummary.bind(reportController)
);

// Today's sales
router.get(
  "/today-sales",
  reportController.todaySales.bind(reportController)
);

// Cash at hand
router.get(
  "/cash-at-hand",
  reportController.cashAtHand.bind(reportController)
);

// Sales trend chart
router.get(
  "/sales-trend",
  reportController.salesTrend.bind(reportController)
);

// Expense breakdown chart
router.get(
  "/expense-breakdown",
  reportController.expenseBreakdown.bind(reportController)
);

// Top 5 products chart
router.get(
  "/top-products",
  reportController.topProducts.bind(reportController)
);

router.get(
  "/dashboard",
  reportController.dashboard.bind(reportController)
);

export default router;