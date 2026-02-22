import { ReportRepository } from "../repository/report.repository.js";
import { ReportPeriodDto } from "../dto/report-period.dto.js";

export class ReportService {
  constructor(private reportRepo: ReportRepository) {}

  // Profit & Loss for a selected period
  async profitAndLoss(
    businessId: string,
    branchId: string,
    period: ReportPeriodDto
  ) {
    const revenue = await this.reportRepo.getRevenue(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const cogs = await this.reportRepo.getCOGS(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const operatingExpenses = await this.reportRepo.getOperatingExpenses(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - operatingExpenses;

    return {
      revenue,
      costOfGoodsSold: cogs,
      grossProfit,
      operatingExpenses,
      netProfit,
    };
  }

  // Cashflow for a period
  async cashflow(
    businessId: string,
    branchId: string,
    period: ReportPeriodDto
  ) {
    const flow = await this.reportRepo.getCashflow(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    return {
      inflow: flow.inflow,
      outflow: flow.outflow,
      netCashflow: flow.inflow - flow.outflow,
    };
  }

  // Balance sheet snapshot (current)
  async balanceSheet(businessId: string, branchId: string) {
    const assets = await this.reportRepo.getAssets(businessId, branchId);
    const liabilities = await this.reportRepo.getLiabilities(
      businessId,
      branchId
    );

    return {
      assets,
      liabilities,
      equity: assets - liabilities,
    };
  }

  // Business summary (for dashboard card)
  async businessSummary(
    businessId: string,
    branchId: string,
    period: ReportPeriodDto
  ) {
    const revenue = await this.reportRepo.getRevenue(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );
    const cogs = await this.reportRepo.getCOGS(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );
    const expenses = await this.reportRepo.getOperatingExpenses(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const liabilities = await this.reportRepo.getLiabilities(
      businessId,
      branchId
    );
    const inventoryValue = await this.reportRepo.getInventoryValue(
      businessId,
      branchId
    );
    const assets = await this.reportRepo.getAssets(businessId, branchId);

    const profit = revenue - cogs - expenses;
    const debtRatio = assets > 0 ? liabilities / assets : 0;

    return {
      revenue,
      profit,
      assets,
      inventoryValue,
      outstandingLiabilities: liabilities,
      debtRatio,
    };
  }

  // Today's sales
  async getTodaySales(businessId: string, branchId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return this.reportRepo.getRevenue(businessId, branchId, todayStart, todayEnd);
  }

  // Dashboard summary (combines todaySales + key metrics)
  async dashboardSummary(
    businessId: string,
    branchId: string,
    period: ReportPeriodDto
  ) {
    const todaySales = await this.getTodaySales(businessId, branchId);

    const revenue = await this.reportRepo.getRevenue(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const cogs = await this.reportRepo.getCOGS(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const operatingExpenses = await this.reportRepo.getOperatingExpenses(
      businessId,
      branchId,
      period.startDate,
      period.endDate
    );

    const netProfit = revenue - cogs - operatingExpenses;

    const liabilities = await this.reportRepo.getLiabilities(businessId, branchId);
    const inventoryValue = await this.reportRepo.getInventoryValue(
      businessId,
      branchId
    );

    return {
      todaySales,
      netProfit,
      inventoryValue,
      outstandingLiabilities: liabilities,
    };
  }

  // Cash at hand (current balance)
  async cashAtHand(businessId: string, branchId: string) {
    const flow = await this.reportRepo.getCashflow(
      businessId,
      branchId,
      new Date(0),
      new Date()
    );

    return flow.inflow - flow.outflow;
  }

  // Sales trend for report charts
  async salesTrend(businessId: string, branchId: string, period: ReportPeriodDto) {
    return this.reportRepo.salesTrend(businessId, branchId, period);
  }

  // Expense breakdown for report charts
  async expenseBreakdown(
    businessId: string,
    branchId: string,
    period: ReportPeriodDto
  ) {
    return this.reportRepo.expenseBreakdown(businessId, branchId, period);
  }

  // Top selling products for report charts
  async topProducts(
    businessId: string,
    branchId: string,
    period: ReportPeriodDto
  ) {
    return this.reportRepo.topProducts(businessId, branchId, period);
  }

  async getDashboardData(businessId: string, branchId: string, period: ReportPeriodDto) {
  // Parallelize all calls
  const [
    todaySales,
    cashAtHand,
    dashboardSummary,
    profitLoss,
    cashflow,
    balanceSheet,
    salesTrend,
    expenseBreakdown,
    topProducts
  ] = await Promise.all([
    this.getTodaySales(businessId, branchId),
    this.cashAtHand(businessId, branchId),
    this.dashboardSummary(businessId, branchId, period),
    this.profitAndLoss(businessId, branchId, period),
    this.cashflow(businessId, branchId, period),
    this.balanceSheet(businessId, branchId),
    this.reportRepo.salesTrend(businessId, branchId, period),
    this.reportRepo.expenseBreakdown(businessId, branchId, period),
    this.reportRepo.topProducts(businessId, branchId, period),
  ]);

  return {
    todaySales,
    cashAtHand,
    dashboardSummary,
    profitLoss,
    cashflow,
    balanceSheet,
    salesTrend,
    expenseBreakdown,
    topProducts
  };
}
}