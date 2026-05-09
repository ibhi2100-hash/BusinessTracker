import { Events } from "../../../domain/event.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class InventoryRepository {
    async findExisting(id: string, productId: string, tx: Prisma.TransactionClient) {
        return tx.inventory.findUnique({
            where: {
                id,
                productId
            }
        })
    }
    async createOrUpdateInventory(event: Events, tx: Prisma.TransactionClient) {
        const { payload } = event;
        const existing = await this.findExisting(payload.id, payload.productId, tx);

        if(existing) {
            await tx.inventory.update({
                where: {id: existing.id},
                data: {
                    quantity: existing.quantity + payload.quantity,
                    updatedAt: new Date(event.createdAt)
                }
            })
        }else {
            await tx.inventory.create({
            data: {
                id: payload.id,
                productId: payload.productId,
                businessId: event.businessId,
                branchId: event.branchId,
                quantity: payload.quantity,
                costPrice: payload.costPrice,
                createdAt: new Date(event.createdAt)
            }
        })
        }

        
    }
}