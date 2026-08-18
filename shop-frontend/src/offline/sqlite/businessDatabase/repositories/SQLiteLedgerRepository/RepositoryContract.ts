import {
  LedgerEntry,
  Account
} from "@business/shared-types";


export interface LedgerAccountTotals {
  totalDebits: number;
  totalCredits: number;
}


export interface LedgerRepository {

  append(
    entries: LedgerEntry[]
  ): Promise<void>;

  getById(
    id: string
  ): Promise<LedgerEntry | null>;

  getByEvent(
    eventId: string
  ): Promise<LedgerEntry[]>;

  getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]>;

  getByBranch(
    branchId: string
  ): Promise<LedgerEntry[]>;

  getByAccount(
    account: Account
  ): Promise<LedgerEntry[]>;

  getAccountTotals(
    businessId: string,
    account: Account
  ): Promise<LedgerAccountTotals>;

  verifyEvent(
    eventId: string
  ): Promise<boolean>;
  getDashboard(
    branchId: string
  ): Promise<any>
}