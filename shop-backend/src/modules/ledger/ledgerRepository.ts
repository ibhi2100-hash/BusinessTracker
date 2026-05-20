import { LedgerEntry } from "../../domain/ledger.js";
import { Prisma, Account } from "../../infrastructure/postgresql/prisma/generated/client.js";

const NORMAL_BALANCE: Record<
  Account,
  "DEBIT" | "CREDIT"
> = {
  CASH: "DEBIT",

  BANK: "DEBIT",

  INVENTORY: "DEBIT",

  COGS: "DEBIT",

  EXPENSE: "DEBIT",

  FIXED_ASSETS: "DEBIT",

  REVENUE: "CREDIT",

  LIABILITIES: "CREDIT",

  OWNER_CAPITAL: "CREDIT",

  OWNER_DRAWINGS: "DEBIT",

  INTER_BRANCH: "DEBIT",
}


export class LedgerRepository {
    async bulkAddEntries(entries: LedgerEntry[], businessId: string, branchId: string, tx: Prisma.TransactionClient){
    
        return tx.ledgerEntry.createMany({
            data: entries.map((entry) => ({
                id: entry.id,
                eventId: entry.eventId,
                businessId,
                branchId,
                branchBusinessId: businessId,
                type: entry.type,
                account: entry.account,
                direction: entry.direction,
                amount: entry.amount,
                index: entry.index,
                createdAt: new Date(entry.createdAt)
            })),
            skipDuplicates: true
        })
    }

    async ledgerSnapshot(
    businessId: string,
    branchId: string,
    tx: Prisma.TransactionClient
  ) {

    const ledger =
      await tx.ledgerEntry.groupBy({

        by: [
          "account",
          "direction",
        ],

        where: {
          businessId,
          branchId,
        },

        _sum: {
          amount: true,
        },
      })

    // Initialize ALL accounts
    const balances: Record<
      Account,
      number
    > = {
      CASH: 0,

      BANK: 0,

      INVENTORY: 0,

      COGS: 0,

      EXPENSE: 0,

      LIABILITIES: 0,

      REVENUE: 0,

      OWNER_CAPITAL: 0,

      OWNER_DRAWINGS: 0,

      FIXED_ASSETS: 0,

      INTER_BRANCH: 0,
    }

    for (const row of ledger) {

      const account =
        row.account

      const direction =
        row.direction

      const amount =
        Number(
          row._sum.amount ?? 0
        )

      const normal =
        NORMAL_BALANCE[account]

      // If direction matches normal balance:
      // increase account
      if (direction === normal) {

        balances[account] += amount

      } else {

        balances[account] -= amount
      }
    }

    return balances
  } 
}