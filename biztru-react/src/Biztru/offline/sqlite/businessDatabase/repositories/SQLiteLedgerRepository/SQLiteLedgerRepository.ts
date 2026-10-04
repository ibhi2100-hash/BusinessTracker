// SQLiteLedgerRepository.ts

import type {
  LedgerEntry,
  Account,
} from "@business/shared-types";

import type{
  LedgerRepository,
  LedgerAccountTotals,
} from "@business/ledger-engine";

import {
  LedgerStatements,
} from "../../statements/ledger/LedgerStatements";

import {
  LedgerMapper,
} from "./LedgerMapper";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { ledgerKeys } from "../../statements/ledger/ledgerKeys";


export class SQLiteLedgerRepository
  implements LedgerRepository
{
  private readonly statements: LedgerStatements;
  constructor(
    statements: LedgerStatements
  ) {
    this.statements = statements
  }


  // ============================================================
  // TRANSACTION OPERATIONS
  // ============================================================

  /**
   * Build ledger insert operations without executing them.
   *
   * Used when ledger writes must participate in a larger
   * SQLite transaction.
   *
   * Example:
   *
   * const operations = [
   *   ...ledger.appendOperations(entries),
   *   ...otherRepositoryOperations
   * ];
   *
   * await transaction.run(operations);
   */
  appendOperations(
    entries: readonly LedgerEntry[]
  ): SQLiteStatementOperation[] {

    return entries.map(
      entry => ({
        statementKey:
          ledgerKeys.append,

        params:
          LedgerMapper.toInsert(entry),
      })
    );
  }


  /**
   * Build one ledger insert operation.
   *
   * Useful when the caller already has a single entry.
   */
  appendOperation(
    entry: LedgerEntry
  ): SQLiteStatementOperation {

    return {
      statementKey:
        ledgerKeys.append,

      params:
        LedgerMapper.toInsert(entry),
    };
  }


  // ============================================================
  // IMMEDIATE WRITE
  // ============================================================

  /**
   * Immediate non-transactional append.
   *
   * Use this when the ledger write does not need to be grouped
   * with other database operations.
   */
  async append(
    entries: readonly LedgerEntry[]
  ): Promise<void> {

    for (const entry of entries) {

      await this.statements.append.execute(
        LedgerMapper.toInsert(entry)
      );
    }
  }


  // ============================================================
  // READS
  // ============================================================

  async getById(
    id: string
  ): Promise<LedgerEntry | null> {

    const rows =
      await this.statements.findById.query<LedgerEntry>([
        id,
      ]);

    return rows[0] ?? null;
  }


  async getByEvent(
    eventId: string
  ): Promise<LedgerEntry[]> {

    return this.statements.findByEvent
      .query<LedgerEntry>([
        eventId,
      ]);
  }


  async getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]> {

    return this.statements.findByBusiness
      .query<LedgerEntry>([
        businessId,
      ]);
  }


  async getByBranch(
    branchId: string
  ): Promise<LedgerEntry[]> {

    return this.statements.findByBranch
      .query<LedgerEntry>([
        branchId,
      ]);
  }


  async getByAccount(
    account: Account
  ): Promise<LedgerEntry[]> {

    return this.statements.findByAccount
      .query<LedgerEntry>([
        account,
      ]);
  }


  async getAccountTotals(
    businessId: string,
    account: Account
  ): Promise<LedgerAccountTotals> {

    const result =
      await this.statements.accountTotals
        .query<LedgerAccountTotals>([
          businessId,
          account,
        ]);

    return result[0] ?? {
      totalDebits: 0,
      totalCredits: 0,
    };
  }


  // ============================================================
  // INTEGRITY
  // ============================================================

  async verifyEvent(
    eventId: string
  ): Promise<boolean> {

    const result =
      await this.statements.verifyEvent
        .query<LedgerAccountTotals>([
          eventId,
        ]);

    const totals = result[0];

    if (!totals) {
      return false;
    }

    return (
      totals.totalDebits ===
      totals.totalCredits
    );
  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  async getDashboard(
    branchId: string
  ): Promise<any> {

    return this.statements.dashboard.query([
      branchId,
    ]);
  }
}