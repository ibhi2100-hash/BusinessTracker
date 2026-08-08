"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductReducer = void 0;
const shared_types_1 = require("@business/shared-types");
class ProductReducer {
    reduce(state, event) {
        switch (event.type) {
            case "PRODUCT_CREATED":
                return {
                    id: event.payload.id,
                    name: event.payload.name,
                    price: event.payload.price,
                    costPrice: event.payload.costPrice,
                    imageUrl: event.payload.imageUrl,
                    businessId: event.businessId ?? undefined,
                    branchId: event.branchId ?? undefined,
                    isActive: true,
                    isDeleted: false,
                    createdAt: event.createdAt,
                    updatedAt: event.createdAt,
                };
            case "PRODUCT_UPDATED":
                if (!state) {
                    return state;
                }
                return {
                    ...state,
                    name: event.payload.name,
                    price: event.payload.price,
                    costPrice: event.payload.costPrice,
                    updatedAt: event.createdAt
                };
            case "PRODUCT_DELETED":
                if (!state) {
                    return state;
                }
                return {
                    ...state,
                    isActive: false,
                    isDeleted: true,
                    deletedAt: event.createdAt,
                };
            case shared_types_1.InventoryEventType.INVENTORY_RECEIVED: {
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
                    updatedAt: event.createdAt
                };
            }
            default:
                return state;
        }
    }
}
exports.ProductReducer = ProductReducer;
