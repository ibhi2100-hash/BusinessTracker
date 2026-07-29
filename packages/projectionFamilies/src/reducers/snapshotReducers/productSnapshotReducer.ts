import {
  Product,
  IntegrationEvent
} from "@business/shared-types";

import { SnapshotReducer }from "@business/snapshot-engine";

export const ProductSnapshotReducer:
SnapshotReducer<Product | null> = {

  aggregateType: "PRODUCT",

  initialState(): Product {
    return {
      id: null as any,
      businessId: null as any,
      branchId: null as any,
      name: "",
      price: 0,
      costPrice: 0,
      imageUrl: "",
      isActive: true,
      isDeleted: false,
      createdAt: new Date(0),
      updatedAt: new Date(0)
    };
  },

  reduce(current: any, event: IntegrationEvent
  ) {

    switch (event.type) {

      case "PRODUCT_CREATED":

        return {
          id: event.aggregateId,

          businessId:
            event.businessId,

          branchId:
            event.branchId,

          name:
            event.payload.name,

          price:
            event.payload.price,

          costPrice:
            event.payload.costPrice,

          imageUrl:
            event.payload.imageUrl,

          isActive: true,

          isDeleted: false,

          createdAt:
            new Date(event.createdAt),

          updatedAt:
            new Date(event.createdAt)
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
            new Date(event.createdAt)
        };

      case "PRODUCT_DELETED":

        if (!current) {
          return current;
        }

        return {

          ...current,

          isDeleted: true,

          isActive: false,

          updatedAt:
            new Date(event.createdAt)
        };

      default:
        return current;
    }
  }
};