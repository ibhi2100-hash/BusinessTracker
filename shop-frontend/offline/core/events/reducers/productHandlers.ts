import { getDb } from "@/offline/core/db/indexDB";
import { TABLES } from "@/offline/core/db/schema";

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