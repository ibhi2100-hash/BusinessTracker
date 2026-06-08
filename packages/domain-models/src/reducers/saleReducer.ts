import { Product, salesEventType } from "@business/shared-types";

import { BaseEvent } from "@business/shared-types";

export const SaleReducer = {

  reduce(
    current: any,
    event: BaseEvent
  ) {

    switch (event.type) {

      case salesEventType.SALE_ADDED:

        return {

          id:
            event.payload.id,

          sellingPrice:
            event.payload.sellingPrice,

          costPrice:
            event.payload.costPrice,

          productId: event.payload.productId,

          businessId:
            event.businessId ?? undefined,

          branchId:
            event.branchId ?? undefined,

          createdAt:
            new Date(event.createdAt),

          updatedAt:
            new Date(event.createdAt),
        };

      default:
        return current;
    }
  }
};
