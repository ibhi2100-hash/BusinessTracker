import { LedgerEntry, Account } from "@business/shared-types";

export interface LedgerRepository {
  append(entries: LedgerEntry[]): Promise<void>;

  getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]>;

  getByBranch(
    branchId: string
  ): Promise<LedgerEntry[]>;

  getByAccount(
    account: Account
  ): Promise<LedgerEntry[]>;
}