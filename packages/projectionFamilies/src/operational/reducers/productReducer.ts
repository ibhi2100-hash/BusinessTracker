import { InventoryEventType, Product } from "@business/shared-types";

import { BaseEvent } from "@business/shared-types";

export const ProductReducer = {
    initialState: () => ({
    id: "",
    businessId: "",
    branchId: "",
    name: "",
    imageUrl: "",
    description: "",
    
    costPrice: 0,
    price: 0,
    isDeleted: false,

  }),

  reduce(
    current: Product | null,
    event: BaseEvent
  ): Product | null {

    switch (event.type) {

      case "PRODUCT_CREATED":

        return {

          id:
            event.payload.id!,

          name:
            event.payload.name,

          price:
            event.payload.price,

          costPrice:
            event.payload.costPrice,

          imageUrl:
            event.payload.imageUrl,

          businessId:
            event.businessId ?? undefined,

          branchId:
            event.branchId ?? undefined,

          isActive: true,

          isDeleted: false,

          createdAt:
            new Date(event.createdAt),

          updatedAt:
            new Date(event.createdAt),
        };

      case "PRODUCT_UPDATED":

        if (!current) {
          return current;
        }

        return {

          ...current,

          name:
            event.payload.name,

          price:
            event.payload.price,

          costPrice:
            event.payload.costPrice,

          updatedAt:
            new Date(event.createdAt),
        };

      case "PRODUCT_DELETED":

        if (!current) {
          return current;
        }

        return {

          ...current,

          isActive: false,

          isDeleted: true,

          deletedAt:
            new Date(event.createdAt),
        };

       case InventoryEventType.INVENTORY_RECEIVED: {

         if (!current) {
           return current;
         }

         const newCost = event.payload.costPrice;

         if (newCost === current.costPrice) {
           return current;
         }

         return {
           ...current,
           costPrice: newCost,
           updatedAt: event.createdAt
         };
       }

      default:
        return current;
    }
  }
};