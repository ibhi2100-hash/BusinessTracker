const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchFinancialSummary(branchId: string, startDate?: string, endDate?: string) {
  const query = startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
  const res = await fetch(`${API_URL}/report/${branchId}/financial-summary?1=1${query}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load financial summary");
  return res.json();
}

export async function fetchProfitLoss(branchId: string, startDate: string, endDate: string) {
  const res = await fetch(
    `${API_URL}/report/${branchId}/profit-loss?startDate=${startDate}&endDate=${endDate}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to load profit & loss");
  return res.json();
}

export async function fetchCashflow(branchId: string, startDate: string, endDate: string) {
  const res = await fetch(
    `${API_URL}/report/${branchId}/cashflow?startDate=${startDate}&endDate=${endDate}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to load cashflow");
  return res.json();
}

export async function fetchBalanceSheet(branchId: string) {
  const res = await fetch(`${API_URL}/report/${branchId}/balance-sheet`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load balance sheet");
  return res.json();
}