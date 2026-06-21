import { AppDB } from "@/src/db";
import { LedgerRepository } from "@business/ledger-engine";
import { Account, LedgerEntry } from "@business/shared-types";

export class IndexedDbLedgerRepo implements LedgerRepository {
    constructor(
        private readonly db: AppDB
    ){}
    async append(entries: LedgerEntry[]): Promise<void> {
        await this.db.ledgerEntries.bulkPut(entries)
    }

    async getByAccount(account: Account): Promise<LedgerEntry[]> {
        return await this.db.ledgerEntries
            .where("account")
            .equals(account)
            .toArray()
    }

    async getByBusiness(businessId: string): Promise<LedgerEntry[]> {
        return await this.db.ledgerEntries
            .where("businessId")
            .equals(businessId)
            .toArray()
    }

    async getByBranch(branchId: string): Promise<LedgerEntry[]> {
        return await this.db.ledgerEntries
            .where("branchId")
            .equals(branchId)
            .toArray()
    }
}