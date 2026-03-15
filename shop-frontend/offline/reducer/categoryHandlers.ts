import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";

export const categoryHandlers = {
    createCategory: async (event: any)=> {
        const { id, name, businessId } = event.payload;
        await addRecord(TABLES.CATEGORIES, {
            id,
            name,
            businessId
        })
    },
    createBrand: async (event: any)=> {

        const { id, name, categoryId } = event.payload

        await addRecord(TABLES.BRANDS, {
            id,
            name,
            categoryId
        })
    }
}