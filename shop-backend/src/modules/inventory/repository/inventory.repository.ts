import { connect } from "node:http2";
import { Prisma, StockMovementType } from "../../../infrastructure/postgresql/prisma/generated/client.js";
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
        businessId: string,
        branchId: string,
        productId: string,
        quantity: number,
        sellingPrice: any,
        costPrice: any,
        tx: Prisma.TransactionClient
    ){
        return tx.stockMovement.create({
            data: {
                businessId,
                branchId,
                productId,
                type: "SALE",
                quantity,
                sellingPrice,
                costPrice,
            },
        });

    }

    async createStockMovement(data: {
        productId: string;
        businessId: string;
        branchId: string;
        type: StockMovementType;
        quantity: number;
        costPrice?: number;
        }, tx: Prisma.TransactionClient) {
        const movement = await tx.stockMovement.create({
            data: {
                productId: data.productId,
                type: data.type,
                quantity: data.quantity,
                costPrice: data.costPrice ?? null,
                businessId: data.businessId,
                branchId: data.branchId
            }
        });
        await tx.product.update({
            where: { id: data.productId },
            data: { quantity: { increment: data.quantity } }
        });
        return movement;
        }


}