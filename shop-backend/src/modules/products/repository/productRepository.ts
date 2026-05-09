import { Events } from "../../../domain/event.js";
import { Product } from "../../../domain/products.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class ProductRepository {
    async findExistingProduct(productId: string, tx: Prisma.TransactionClient){
        await tx.products.findFirst({
            where: {
                id: productId, 
                isActive: true,
            }
        })
    }

    async createProduct(event: Events, tx: Prisma.TransactionClient){
        const { payload } = event;

        const savedProduct = await tx.products.create({
            data: {
                id: payload.id,
                businessId: event.businessId,
                branchId: event.branchId,
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

    async getBranchProduct(event: Events, tx: Prisma.TransactionClient ){
        const products = await tx.products.findMany({
            where: {
                branchId: event.branchId,
                isActive: true
            }
        })

        return products
    }
}