import { getDb } from "@/offline/core/db/indexDB";
import { TABLES } from "../../db/schema";


export const salesHandlers= {
    async create(event: any){
        const db = await getDb();

        const { saleId, productId, quantity, amount, branchId } = event.payload;

        await db.add(TABLES.SALES, {
            id: saleId,
            productId,
            quantity,
            amount,
            branchId,
        });
    }


}