import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";

export const productHandlers = {
    createProduct: async (event: any)=> {
        const { id, name, brandId, categoryId } = event.payload;

        await addRecord(TABLES.PRODUCTS, {
            id,
            name, 
            categoryId,
            brandId
        })
    }
}