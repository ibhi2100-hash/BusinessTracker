import { getByIndex } from "../core/db/helpers";
import { getDb } from "../core/db/indexDB";
import { TABLES } from "../db/schema";

export  const salesHandler =  {
    createSale: async (event: any)=> {
        const db = await getDb();

        const { saleId, productId, quantity, price, branchId } = event.payload;
        await db.put(TABLES.SALES, {
            id: saleId,
            productId,
            quantity,
            price,
            branchId
        });

        const inventory = await getByIndex(TABLES.INVENTORY, "productId", productId);

        const stock = inventory.find(i => i.branchId === branchId)

        if(stock) {
            stock.quantity += quantity
            await db.put(TABLES.INVENTORY, stock)
        }
    }
}