import { getByIndex } from "../db/helpers";
import { getDb } from "../db/indexDB";
import { TABLES } from "../db/schema";

export const inventoryHandlers = {
    opening: async (event: any )=> {
        const db = await getDb();

        const { productId, quantity, branchId } = event.payload;

        await db.put(TABLES.INVENTORYSTORE, {
            id: crypto.randomUUID(),
            productId,
            branchId,
            quantity
        })
    },

    add: async (event: any)=> {
        const db = await getDb();
        const { id, productId, quantity, branchId } = event.payload;

        const items = await getByIndex(TABLES.INVENTORY, "productId", productId );
        const record = items.find(i => i.branchId === branchId);
        if(record){
            record.quantity += quantity

            await db.put(TABLES.INVENTORY, record)
        }
    }
}