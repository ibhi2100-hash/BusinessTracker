import { LedgerEntry } from "../../domain/ledger.js";
import { Prisma } from "../../infrastructure/postgresql/prisma/generated/client.js";


export class LedgerRepository {
    async bulkAddEntries(entries: LedgerEntry[], businessId: string, branchId: string, tx: Prisma.TransactionClient){
        return tx.ledgerEntry.createMany({
            data: entries.map((entry) => ({
                id: entry.id,
                eventId: entry.eventId,
                businessId: entry.businessId,
                branchId: entry.branchId,
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

    async ledgerSnapshot(businessId: string, branchId: string, tx: Prisma.TransactionClient){
        const ledger = await tx.ledgerEntry.groupBy({
            by: ["account", "direction"],
            where: { businessId },

            _sum: {
                amount: true
            }
        });

        const balances = {
            CASH: 0,
            INVENTORY: 0,
            REVENUE: 0,
            COGS: 0,
            EXPENSES: 0,
            LIABILITIES: 0
        }

        for(const row of ledger){
            const amount = row._sum.amount ?? 0;

            if(row.direction === "DEBIT"){
                balances[row.account] += amount
            }else {
                balances[row.account] -= amount
            }
        }
    }
}