import { AppDB } from "@/src/db";
import { BaseEvent } from "../../types";


export const ProductHandler = {
    async create(db: AppDB, event: BaseEvent) {
        const { id, name, price, costPrice, imageUrl } = event.payload;

        const existing = await db.products.get(id);
        if (existing) return;

        await db.products.add({
            id,
            name,
            price,
            costPrice,
            imageUrl,
            businessId: event.businessId,
            branchId: event.branchId,
            isActive: true,
            isDeleted: false,
            createdAt: Date.now()
        });
        },
    async update(db: AppDB, event: BaseEvent){
        const { productId, name, costPrice, price } = event.payload;
         const existing = await db.products.get(productId);
        if(!existing) return;
    
        await db.products.update(productId, {
            name,
            price,
            costPrice,
            updatedAt: Date.now(),

        })
    },
    async delete(db:AppDB, event: BaseEvent){
        const { productId } = event.payload;
        const existing = await db.products.get(productId);
        if(!existing) return;

        await db.products.update(productId, {
            isActive: false,
            isDeleted: true,
            deletedAt: Date.now()
        })
    }
}
