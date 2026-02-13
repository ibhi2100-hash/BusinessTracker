import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class inventoryRepository {
    async findActiveProduct(
        productId: string,
        businessId: string,
        tx: Prisma.TransactionClient
    ){
        return tx.product.findFirst({
            where:{
                id: productId,
                businessId,
                isActive: true
            },
        });

    }

    async decrementStock(
        productId: string,
        quantity: number,
        tx: Prisma.TransactionClient,
    ){
        return tx.product.update({
            where: {
                id: productId
            },
            data:{
                quantity: {
                    decrement: quantity
                },
            },
        });
    }

    async incrementStock(
        productId: string,
        quantity:number,
        tx: Prisma.TransactionClient
    ){
        return tx.product.update({
            where: {id: productId},
            data: {
                quantity: {
                    increment: quantity,
                },
            },
        });
    }

    async recordStockOut(
        productId: string,
        quantity: number,
        sellingPrice: any,
        tx: Prisma.TransactionClient
    ){
        return tx.stockMovement.create({
            data: {
                productId,
                type: "STOCK_OUT",
                quantity,
                sellingPrice,
            },
        });

    }

    async recordStockIn(
        productId: string,
        quantity: number,
        costPrice: number,
        tx: Prisma.TransactionClient
    ){
        return tx.stockMovement.create({
            data: {
                productId,
                type: "STOCK_IN",
                quantity,
                costPrice,
            },
        });
    }

}