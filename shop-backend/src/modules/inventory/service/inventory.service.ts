import { errorMonitor } from "node:events";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { inventoryRepository } from "../repository/inventory.repository.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { SaleProductSnapshot } from "../../sales/dto/saleproductsnap.js";

export class InventoryService {
    private inventoryRepo = new inventoryRepository();
    async validateAndReduceStock(
        businessId: string,
        branchId: string,
        items: {
            productId: string;
            quantity: number;
        }[],
        tx: Prisma.TransactionClient
    ) {
        for ( const item of items ){
            const product = await this.inventoryRepo.findActiveProduct(item.productId, businessId, branchId, tx)
            
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
            const stockmovement = await this.inventoryRepo.recordStockOut(
                businessId,
                branchId,
                product.id,
                item.quantity,
                product.sellingPrice,
                product.costPrice,
                tx
            );
        }
    }

    async reduceStockFromSnapshot(
        businessId: string,
        branchId: string,
        snapshots: SaleProductSnapshot[],
        tx: Prisma.TransactionClient
    ) {
        for (const item of snapshots) {

    const product = await this.inventoryRepo.findActiveProduct(
        item.productId,
        businessId,
        branchId,
        tx
        );

        if (!product) {
        throw new Error(`Product not found`);
        }

        if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock`);
        }

        await this.inventoryRepo.decrementStock(
        product.id,
        item.quantity,
        tx
        );

      // record movement using snapshot pricing
      await this.inventoryRepo.recordStockOut(
        businessId,
        branchId,
        item.productId,
        item.quantity,
        new Prisma.Decimal(item.sellingPrice),
        new Prisma.Decimal(item.costPrice),
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
    }
}