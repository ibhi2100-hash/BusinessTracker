
import type {
  BusinessInvoice,
  BusinessPayment,
} from "../../../../types/billing/billing-financia.types";

import { platformRequest } from "../platformApiClient";

const BASE = "";

export const billingFinancialApi = {
  async invoices(accessToken: string): Promise<BusinessInvoice[]> {
    const result = await platformRequest<{
      invoices: BusinessInvoice[];
    }>(`${BASE}/invoices`, accessToken);

    return result.invoices;
  },

  async payments(accessToken: string): Promise<BusinessPayment[]> {
    const result = await platformRequest<{
      payments: BusinessPayment[];
    }>(`${BASE}/payments`, accessToken);

    return result.payments;
  },

  async getInvoice(
    invoiceId: string,
    accessToken: string
  ): Promise<BusinessInvoice> {
    const result = await platformRequest<{
      invoice: BusinessInvoice;
    }>(
      `${BASE}/invoices/${encodeURIComponent(invoiceId)}`,
      accessToken
    );

    return result.invoice;
  },
};
