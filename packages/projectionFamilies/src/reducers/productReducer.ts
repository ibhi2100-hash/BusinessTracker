import { DomainEvent, InventoryEventType, Product } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface ProductPayload {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  costPrice: number;
  price: number;
}export class ProductReducer
implements ProjectionReducer<Product, DomainEvent<ProductPayload>> {
  reduce(state: Product , event: DomainEvent<ProductPayload>): Product {
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

          createdAt:  event.metadata.occuredAt,

          updatedAt:  event.metadata.occuredAt,
        };

      case "PRODUCT_UPDATED":

        if (!state) {
          return state;
        }

        return {

          ...state,

          name:
            event.payload.name,

          price:
            event.payload.price,

          costPrice:
            event.payload.costPrice,

          updatedAt:
            event.metadata.occuredAt
        };

      case "PRODUCT_DELETED":

        if (!state) {
          return state;
        }

        return {

          ...state,

          isActive: false,

          isDeleted: true,

          deletedAt: event.metadata.occuredAt,
        };

       case InventoryEventType.INVENTORY_RECEIVED: {

         if (!state) {
           return state;
         }

         const newCost = event.payload.costPrice;

         if (newCost === state.costPrice) {
           return state;
         }

         return {
           ...state,
           costPrice: newCost,
           updatedAt: event.metadata.occuredAt
         };
       }

      default:
        return state;
    }
  }
  }
