import { LedgerRepository } from "@business/ledger-engine";
import { AppDB } from "@/src/db";
import { Account, LedgerEntry } from "@business/shared-types";


export class IndexedDbLedgerRepository
  implements LedgerRepository {

  constructor(
    private db: AppDB
  ) {}

  async append(
    entries: LedgerEntry[]
  ) {
    await this.db.ledgerEntries.bulkPut(entries)
  }

  async getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]>
  {
    return this.db.ledgerEntries
        .where("businessId")
        .equals(businessId)
        .toArray()
  }

  async getByBranch(branchId: string): Promise<LedgerEntry[]> {
         return this.db.ledgerEntries
        .where("branchId")
        .equals(branchId)
        .toArray()
  }

  async getByAccount(account: Account): Promise<LedgerEntry[]> {
         return this.db.ledgerEntries
        .where("account")
        .equals(account)
        .toArray()
  }
}