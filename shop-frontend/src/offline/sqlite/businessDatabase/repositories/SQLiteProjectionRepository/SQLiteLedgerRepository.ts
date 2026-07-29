import { LedgerEntry } from "@business/shared-types";
import { getDB } from "../../sqlite/database/db";


export class SQLiteLedgerRepository {

  async append(
    entry: LedgerEntry
  ) {

    await getDB().query(
      `
      INSERT INTO ledger_entries (
        id,
        eventId,
        account,
        debit,
        credit,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        entry.id,
        entry.eventId,
        entry.account,
        entry.debit,
        entry.credit,
        entry.createdAt
      ]
    );
  }

  async byAccount(
    account: string
  ) {

    return getDB().query(
      `
      SELECT *
      FROM ledger_entries
      WHERE account = ?
      ORDER BY createdAt ASC
      `,
      [account]
    );
  }
}