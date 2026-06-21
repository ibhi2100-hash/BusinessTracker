import { IntegrationEvent, salesEventType } from "@business/shared-types";


export const SaleReducer = {
    initialState: () => ({
    id: "",
    productId: "",
    price: 0,
    costPrice: 0,
    quantity: 0,
    total: 0

  }),

  reducer (
    current: any,
    event: IntegrationEvent
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
