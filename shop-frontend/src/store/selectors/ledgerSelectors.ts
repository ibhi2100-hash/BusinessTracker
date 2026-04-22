import { db } from "@/offline/core/db/index";

// ---------------------------
// ACCOUNT BALANCE (FAST + CORRECT)
// ---------------------------
export async function getAccountBalance(account: string) {
    const entries = await db.table("ledger")
        .where("account")
        .equals(account)
        .toArray();

    let debit = 0;
    let credit = 0;

    for (const e of entries) {
        debit += e.debit || 0;
        credit += e.credit || 0;
    }

    return debit - credit;
}

export async function getTodayMetrics() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const entries = await db.table("ledger")
        .where("timestamp")
        .aboveOrEqual(start.getTime())
        .toArray();

    let revenue = 0;
    let expenses = 0;
    let cogs = 0;

    for (const e of entries) {
        switch (e.account) {
            case "Revenue":
                revenue += e.credit || 0;
                break;

            case "COGS":
                cogs += e.debit || 0;
                break;

            default:
                // 🔥 treat all non-core expense accounts as expense
                if (
                    e.account !== "Cash" &&
                    e.account !== "Inventory"
                ) {
                    expenses += e.debit || 0;
                }
        }
    }

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    return {
        revenue,
        cogs,
        expenses,
        grossProfit,
        netProfit
    };
}

export async function getCashPosition() {
    return getAccountBalance("Cash");
}

export async function getInventoryValue() {
    return getAccountBalance("Inventory");
}

export async function getLowStockProducts(threshold = 5) {
    const products = await db.table("products").toArray();

    const inventory = await db.table("inventory").toArray();

    const stockMap: Record<string, number> = {};

    for (const item of inventory) {
        stockMap[item.productId] = item.stock;
    }

    return products.filter((p: any) => {
        const stock = stockMap[p.id] ?? 0;
        return stock <= threshold;
    });
}