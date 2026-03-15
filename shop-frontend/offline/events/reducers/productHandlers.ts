import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";

export const productHandlers = {
    async create(event: any) {
        const db = await getDb()
        const { id, name, brandId, categoryId } = event.payload

        await db.add(TABLES.PRODUCTS, {
            id,
            name,
            brandId,
            categoryId
        })
    }
}