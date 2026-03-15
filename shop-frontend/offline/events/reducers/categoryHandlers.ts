import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";


export const categoryHandlers = {
    async create(event: any) {
        const db = await getDb();

        const { id, name, businessId } = event.payload;

        await db.add(TABLES.CATEGORIES, {
            id,
            name,
            businessId
        })

    },

    async createBrand(event: any) {
        const db = await getDb();

        const { id, name, categoryId } = event.payload;

        await db.add(TABLES.BRANDS, {
            id,
            name, 
            categoryId
        })
    }
}