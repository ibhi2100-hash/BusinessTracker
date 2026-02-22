const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchAPI(endpoint: string, startDate?: string, endDate?: string) {
  const query = startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
  const res = await fetch(`${API_URL}/report/${endpoint}?1=1${query}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to load ${endpoint}`);
  return res.json();
}

export async function fetchFinancialSummary(startDate?: string, endDate?: string) {
  return fetchAPI("financial-summary", startDate, endDate);
}

export async function fetchProfitLoss(startDate: string, endDate: string) {
  return fetchAPI("profit-loss", startDate, endDate);
}

export async function fetchCashflow(startDate: string, endDate: string) {
  return fetchAPI("cashflow", startDate, endDate);
}

export async function fetchBalanceSheet() {
  return fetchAPI("balance-sheet");
}

export async function fetchDashboardSummary(startDate?: string, endDate?: string) {
  return fetchAPI("dashboard-summary", startDate, endDate);
}

export async function fetchTodaySales() {
  return fetchAPI("today-sales");
}

export async function fetchCashAtHand() {
  return fetchAPI("cash-at-hand");
}

export async function fetchSalesTrend(startDate: string, endDate: string) {
  return fetchAPI("sales-trend", startDate, endDate);
}

export async function fetchExpenseBreakdown(startDate: string, endDate: string) {
  return fetchAPI("expense-breakdown", startDate, endDate);
}

export async function fetchTopProducts(startDate: string, endDate: string) {
  return fetchAPI("top-products", startDate, endDate);
}

interface DashboardPeriod {
  startDate?: string;
  endDate?: string;
}

export async function fetchDashboardData({ startDate, endDate }: DashboardPeriod = {}) {
  // Build query string only if dates are provided
  const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
  
  const res = await fetch(`${API_URL}/report/dashboard${query}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to load dashboard data");

  return res.json();
}