import {
  LedgerEntry,
  Account
} from "@business/shared-types";

import {
  LedgerRepository,
  LedgerAccountTotals
} from "./RepositoryContract";

import { LedgerStatements }
  from "../../statements/ledger/LedgerStatements";
import { LedgerMapper } from "./LedgerMapper";

export class SQLiteLedgerRepository
  implements LedgerRepository {

  constructor(
    private readonly statements: LedgerStatements
  ) {}


  async append(
    entries: LedgerEntry[]
  ): Promise<void> {

    for (const entry of entries) {

      await this.statements.append.execute(
        LedgerMapper.toInsert(entry)
      );

    }

  }


  async getById(
    id: string
  ): Promise<LedgerEntry | null> {

    const rows =
      await this.statements.findById.query<LedgerEntry>(
        [id]
      );

    return rows[0] ?? null;
  }


  async getByEvent(
    eventId: string
  ): Promise<LedgerEntry[]> {

    return this.statements.findByEvent
      .query<LedgerEntry>(
        [eventId]
      );
  }


  async getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]> {

    return this.statements.findByBusiness
      .query<LedgerEntry>(
        [businessId]
      );
  }


  async getByBranch(
    branchId: string
  ): Promise<LedgerEntry[]> {

    return this.statements.findByBranch
      .query<LedgerEntry>(
        [branchId]
      );
  }


  async getByAccount(
    account: Account
  ): Promise<LedgerEntry[]> {

    return this.statements.findByAccount
      .query<LedgerEntry>(
        [account]
      );
  }


  async getAccountTotals(
    businessId: string,
    account: Account
  ): Promise<LedgerAccountTotals> {

    const result =
      await this.statements.accountTotals
        .query<LedgerAccountTotals>([
          businessId,
          account
        ]);

    return result[0] ?? {
      totalDebits: 0,
      totalCredits: 0
    };
  }


async verifyEvent(
  eventId: string
): Promise<boolean> {

  const result =
    await this.statements.verifyEvent
      .query<LedgerAccountTotals>([
        eventId
      ]);

  const totals = result[0];

  if (!totals) {
    return false;
  }

  return totals.totalDebits === totals.totalCredits;
}
}