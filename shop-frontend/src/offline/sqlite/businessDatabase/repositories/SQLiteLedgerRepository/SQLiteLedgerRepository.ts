// SQLiteLedgerRepository.ts

import { LedgerRepository } from "@business/ledger-engine";
import {
  Account,
  LedgerEntry
} from "@business/shared-types";

import { StorageBusCreator } from "../../../bus/StorageBusCreator";
import { DatabaseTarget } from "../../../protocol/DatabaseTarget";


export class SQLiteLedgerRepository
  implements LedgerRepository {

  async append(
    entries: LedgerEntry[]
  ): Promise<void> {

    const storage = StorageBusCreator();

    for (const entry of entries) {

      await storage.query(
        DatabaseTarget.BUSINESS,
        `
        INSERT INTO ledger_entries (
          id,
          eventId,
          account,
          debit,
          credit,
          businessId,
          branchId,
          description,
          createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          entry.id,
          entry.eventId,
          entry.account,
          entry.debit,
          entry.credit,
          entry.businessId,
          entry.branchId,
          entry.description ?? null,
          entry.createdAt
        ]
      );
    }
  }

  async getByAccount(
    account: Account
  ): Promise<LedgerEntry[]> {

    const rows =
      await getDB().query<LedgerEntry>(
        `
        SELECT *
        FROM ledger_entries
        WHERE account = ?
        ORDER BY createdAt ASC
        `,
        [account]
      );

    return rows;
  }

  async getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]> {

    const rows =
      await getDB().query<LedgerEntry>(
        `
        SELECT *
        FROM ledger_entries
        WHERE businessId = ?
        ORDER BY createdAt ASC
        `,
        [businessId]
      );

    return rows;
  }

  async getByBranch(
    branchId: string
  ): Promise<LedgerEntry[]> {

    const rows =
      await getDB().query<LedgerEntry>(
        `
        SELECT *
        FROM ledger_entries
        WHERE branchId = ?
        ORDER BY createdAt ASC
        `,
        [branchId]
      );

    return rows;
  }
}