import { after } from "node:test";
import { Prisma, StockMovementType } from "../../../infrastructure/postgresql/prisma/generated/client.js";


export class inventoryRepository {
    async findActiveProduct(
        productId: string,
        businessId: string,
        branchId: string,
        tx: Prisma.TransactionClient
    ){
        return tx.product.findFirst({
            where:{
                id: productId,
                businessId,
                branchId,
                isActive: true
            },
        });

    }

async decrementStock(
  productId: string,
  quantity: number,
  tx: Prisma.TransactionClient,
){

    const productBefore = await tx.product.findUniqueOrThrow({
        where: { id: productId},
        select: { quantity: true}
    });

  const result = await tx.product.updateMany({
    where: {
      id: productId,
      quantity: { gte: quantity }   // 👈 prevents negative stock
    },
    data: {
      quantity: { decrement: quantity },
    },
  });

  if (result.count === 0) {
    throw new Error("Insufficient stock or concurrent update detected.");
  }
  const productAfter = await tx.product.findUniqueOrThrow({
    where: { id: productId},
  });
return {
    before: productBefore,
    after: productAfter
}
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
        sellingPrice: Prisma.Decimal,
        costPrice: Prisma.Decimal,
        tx: Prisma.TransactionClient
    ){
        const stockmove = await tx.stockMovement.create({
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
        console.log("Saved:", stockmove.costPrice)
        return stockmove
    }

    async createStockMovement(data: {
        productId: string;
        businessId: string;
        branchId: string;
        type: StockMovementType;
        quantity: number;
        costPrice?: Prisma.Decimal;
        sellingPrice?: Prisma.Decimal
        }, tx: Prisma.TransactionClient) {
        const movement = await tx.stockMovement.create({
            data: {
                productId: data.productId,
                type: data.type,
                quantity: data.quantity,
                costPrice: data.costPrice ?? null,
                sellingPrice: data.sellingPrice ?? null,
                businessId: data.businessId,
                branchId: data.branchId
            }
        });
        return movement;
        }


}