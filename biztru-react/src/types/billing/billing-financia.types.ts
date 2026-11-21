
export type InvoiceStatus =
  | "DRAFT"
  | "OPEN"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "VOID";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REFUNDED";

export interface BusinessInvoice {
  id: string;
  invoiceNumber: string;

  subscriptionId: string;

  currency: string;
  subtotalMinor: string;
  taxMinor: string;
  totalMinor: string;
  amountPaidMinor: string;
  balanceMinor: string;

  status: InvoiceStatus;

  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export interface BusinessPayment {
  id: string;
  invoiceId: string;

  reference: string;
  provider: string;

  amountMinor: string;
  currency: string;

  status: PaymentStatus;

  paidAt: string | null;
  createdAt: string;
}
