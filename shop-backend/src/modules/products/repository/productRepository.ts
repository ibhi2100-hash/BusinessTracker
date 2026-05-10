import { Event } from "../../../domain/event.js";
import { Product } from "../../../domain/products.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class ProductRepository {
    async findExistingProduct(productId: string, tx: Prisma.TransactionClient){
        await tx.product.findFirst({
            where: {
                id: productId, 
                isActive: true,
            }
        })
    }

    async createProduct(event: Event, tx: Prisma.TransactionClient){
        const { payload } = event;
        if(!event.businessId) return;
        if(!event.branchId) return;

        const savedProduct = await tx.product.create({
            data: {
                id: payload.id,
                businessId: event.businessId,
                branchId: event.branchId,
                branchBusinessId: event.businessId,
                
                name: payload.name,
                costPrice: payload.costPrice,
                price: payload.price,

                isActive: true,
                isDeleted: false,

                createdAt: new Date(event.createdAt)
            }
        })

        return savedProduct
    }

    async getBranchProduct(event: Event, tx: Prisma.TransactionClient ){
        if(!event.branchId)return;
        const products = await tx.product.findMany({
            where: {
                branchId: event.branchId,
                isActive: true
            }
        })

        return products
    }
}