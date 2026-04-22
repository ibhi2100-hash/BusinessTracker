import { useStore } from "@/src/store/useStore";

// ---------------------------
// TODAY METRICS
// ---------------------------
export function useTodayMetrics() {
    const sales = useStore((s) => s.sales);
    const products = useStore((s) => s.products);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startTs = start.getTime();

    let revenue = 0;
    let profit = 0;
    let itemsSold = 0;

    for (const sale of sales) {
        if (sale.timestamp < startTs) continue;

        const product = products[sale.productId];
        if (!product) continue;

        revenue += sale.price * sale.quantity;
        profit += (sale.price - product.cost) * sale.quantity;
        itemsSold += sale.quantity;
    }

    return { revenue, profit, itemsSold };
}

// ---------------------------
// STOCK ALERTS
// ---------------------------
export function useLowStock(threshold = 5) {
    const inventory = useStore((s) => s.inventory);
    const products = useStore((s) => s.products);

    return Object.keys(products)
        .filter((id) => (inventory.available[id] ?? 0) <= threshold)
        .map((id) => ({
            ...products[id],
            stock: inventory.available[id] ?? 0
        }));
}

// ---------------------------
// TOTAL STOCK VALUE
// ---------------------------
export function useStockValue() {
    const inventory = useStore((s) => s.inventory);
    const products = useStore((s) => s.products);

    let value = 0;

    for (const id in products) {
        const qty = inventory.available[id] ?? 0;
        value += qty * products[id].cost;
    }

    return value;
}