import { Product } from "@/types/types";

import { BaseEvent } from "../types";

export const ProductReducer = {

  reduce(
    current: Product | null,
    event: BaseEvent
  ): Product | null {

    switch (event.type) {

      case "PRODUCT_CREATED":

        return {

          id:
            event.payload.id,

          name:
            event.payload.name,

          price:
            event.payload.price,

          costPrice:
            event.payload.costPrice,

          imageUrl:
            event.payload.imageUrl,

          businessId:
            event.businessId,

          branchId:
            event.branchId,

          isActive: true,

          isDeleted: false,

          createdAt:
            event.createdAt,

          updatedAt:
            event.createdAt,
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
            event.createdAt,
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
            event.createdAt,
        };

      default:
        return current;
    }
  }
};