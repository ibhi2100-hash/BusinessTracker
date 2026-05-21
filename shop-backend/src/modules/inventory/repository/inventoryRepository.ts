import { Event } from "../../../domain/event.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class InventoryRepository {
    async findExisting(businessId: string, branchId: string, productId: string,  tx: Prisma.TransactionClient) {
        return tx.inventory.findUnique({
            where: {
                businessId_branchId_productId: {
                    businessId,
                    branchId,
                    productId
                }
            }
        })
    }
    async createOrUpdateInventory(event: Event, tx: Prisma.TransactionClient) {
        const { payload } = event;

        if(!event.businessId) return;
        if(!event.branchId) return;

        const existing = await this.findExisting(event.businessId, event.branchId, payload.productId, tx)

        if(existing) {
            await tx.inventory.update({
                where: {id: existing.id},
                data: {
                    quantity: existing.quantity.plus(payload.quantity),
                    updatedAt: new Date(event.createdAt)
                }
            })
        }else {
            await tx.inventory.create({
            data: {
                id: payload.id,
                businessId: event.businessId,
                branchId: event.branchId,
                branchBusinessId: event.businessId,

                productId: payload.productId,

                quantity: payload.quantity,
                costPrice: payload.costPrice,
                createdAt: new Date(event.createdAt)
            },
            });
        }

        
    }
}