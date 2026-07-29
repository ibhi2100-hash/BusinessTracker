"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producteducer = exports.ProductReducer = void 0;
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
                    createdAt: new Date(event.metadata.occuredAt),
                    updatedAt: new Date(event.metadata.occuredAt),
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
                    updatedAt: event.metadata.occuredAt
                };
            case "PRODUCT_DELETED":
                if (!current) {
                    return current;
                }
                return {
                    ...current,
                    isActive: false,
                    isDeleted: true,
                    deletedAt: new Date(event.createdAt),
                };
            case shared_types_1.InventoryEventType.INVENTORY_RECEIVED: {
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
}
exports.ProductReducer = ProductReducer;
exports.Producteducer = {
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
    reduce(current, event) {
    }
};
