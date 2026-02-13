import { errorMonitor } from "node:events";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { inventoryRepository } from "../repository/inventory.repository.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class InventoryService {
    private inventoryRepo = new inventoryRepository();
    async validateAndReduceStock(
        businessId: string,
        items: {
            productId: string;
            quantity: number;
        }[],
        tx: Prisma.TransactionClient
    ) {
        for ( const item of items ){
            const product = await this.inventoryRepo.findActiveProduct(item.productId, businessId, tx)
            
            if(!product){
                throw new Error(`Product with ID ${item.productId} not found or inactive.`);
            }
            if(product.quantity < item.quantity){
                throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
            }

            // Reduce stock
            await this.inventoryRepo.decrementStock(
                product.id,
                item.quantity,
                tx
            )

            //Record stock Movement
            await this.inventoryRepo.recordStockOut(
                product.id,
                item.quantity,
                product.sellingPrice,
                tx
            );
        } 
    }

    async reverseStock(
        params:{
            productId: string,
            quantity: number,
            costPrice?: number;
    },
    tx: Prisma.TransactionClient
){
        await this.inventoryRepo.incrementStock(
            params.productId,
            params.quantity,
            tx
        );

        await this.inventoryRepo.recordStockIn(
            params.productId,
            params.quantity,
            params.costPrice ?? 0,
            tx
        );
    }
}