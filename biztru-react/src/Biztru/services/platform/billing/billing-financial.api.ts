
import type {
  BusinessInvoice,
  BusinessPayment,
} from "../../../types/billing/billing-financial.types";

const BASE_URL = "/api/business/billing";

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load billing records");
  }

  return data as T;
}

export const billingFinancialApi = {
  async invoices(): Promise<BusinessInvoice[]> {
    const result = await request<{
      invoices: BusinessInvoice[];
    }>("/invoices");

    return result.invoices;
  },

  async payments(): Promise<BusinessPayment[]> {
    const result = await request<{
      payments: BusinessPayment[];
    }>("/payments");

    return result.payments;
  },

  async getInvoice(invoiceId: string): Promise<BusinessInvoice> {
    const result = await request<{
      invoice: BusinessInvoice;
    }>(`/invoices/${encodeURIComponent(invoiceId)}`);

    return result.invoice;
  },
};
