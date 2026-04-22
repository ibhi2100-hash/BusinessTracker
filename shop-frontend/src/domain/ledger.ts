export interface LedgerEntry {
  id: string;
  eventId: string;
  businessId: string;
  branchId: string;
  account: string;
  amount: number;
  createdAt: number;
}
