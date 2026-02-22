const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchFinancialSummary( startDate?: string, endDate?: string) {
  const query = startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
  const res = await fetch(`${API_URL}/report/financial-summary?1=1${query}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load financial summary");
  return res.json();
}

export async function fetchProfitLoss(startDate: string, endDate: string) {
  const res = await fetch(
    `${API_URL}/report/profit-loss?startDate=${startDate}&endDate=${endDate}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to load profit & loss");
  return res.json();
}

export async function fetchCashflow( startDate: string, endDate: string) {
  const res = await fetch(
    `${API_URL}/report/cashflow?startDate=${startDate}&endDate=${endDate}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to load cashflow");
  return res.json();
}

export async function fetchBalanceSheet() {
  const res = await fetch(`${API_URL}/report/balance-sheet`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load balance sheet");
  return res.json();
}