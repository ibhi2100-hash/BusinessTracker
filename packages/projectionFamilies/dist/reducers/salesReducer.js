"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReducer = void 0;
const shared_types_1 = require("@business/shared-types");
class SalesReducer {
    reduce(state, event) {
        switch (event.type) {
            case shared_types_1.salesEventType.SALE_ADDED:
                return {
                    id: event.payload.id,
                    businessId: event.businessId,
                    branchId: event.branchId,
                    productId: event.payload.productId,
                    quantity: event.payload.quantity,
                    price: event.payload.price,
                    costPrice: event.payload.costPrice,
                    total: event.payload.quantity *
                        event.payload.price,
                    userId: event.actor.userId,
                    createdAt: new Date(event.createdAt),
                    updatedAt: new Date(event.createdAt),
                };
            default:
                return state;
        }
    }
}
exports.SalesReducer = SalesReducer;
