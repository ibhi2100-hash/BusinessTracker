import { LedgerRepository } from "@business/ledger-engine";
import {
  Account,
  LedgerEntry
} from "@business/shared-types";

import { Prisma }
from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class PrismaLedgerRepo
  implements LedgerRepository {

  constructor(
    private tx: Prisma.TransactionClient
  ) {}

  async append(
    entries: LedgerEntry[]
  ): Promise<void> {

    if (!entries.length) return;

    await this.tx.ledgerEntry.createMany({
      data: entries.map(entry => ({
        id: entry.id,

        eventId: entry.eventId,

        businessId: entry.businessId,
        branchId: entry.branchId,
        branchBusinessId: entry.businessId,

        account: entry.account,
        direction: entry.direction,

        amount: entry.amount,

        type: entry.type,

        index: entry.index,

        createdAt: new Date(
          entry.createdAt
        )
      }))
    });
  }

  async getByBusiness(
    businessId: string
  ): Promise<LedgerEntry[]> {

    const rows =
      await this.tx.ledgerEntry.findMany({
        where: {
          businessId
        },
        orderBy: {
          createdAt: "asc"
        }
      });

    return rows.map(toDomainLedgerEntry);
  }

  async getByBranch(
    branchId: string
  ): Promise<LedgerEntry[]> {

    const rows =
      await this.tx.ledgerEntry.findMany({
        where: {
          branchId: branchId
        },
        orderBy: {
          createdAt: "asc"
        }
      });

    return rows.map(toDomainLedgerEntry);
  }

  async getByAccount(
    account: Account
  ): Promise<LedgerEntry[]> {

    const rows =
      await this.tx.ledgerEntry.findMany({
        where: {
          account
        },
        orderBy: {
          createdAt: "asc"
        }
      });

    return rows.map(toDomainLedgerEntry);
  }
}
export function toDomainLedgerEntry(
  row: any
): LedgerEntry {
  return {
    id: row.id,
    eventId: row.eventId,

    businessId: row.businessId,
    branchId: row.branchId,

    account: row.account as Account,
    direction: row.direction,

    amount: Number(row.amount),

    type: row.type,

    createdAt: row.createdAt.getTime(),
    index: row.index
  };
}