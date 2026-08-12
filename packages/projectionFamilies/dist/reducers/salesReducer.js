"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReducer = void 0;
const shared_types_1 = require("@business/shared-types");
class SalesReducer {
    reduce(state, event) {
        switch (event.type) {
            // =====================================================
            // CREATE SALE
            // =====================================================
            case shared_types_1.salesEventType.SALE_ADDED:
                return this.created(event);
            // =====================================================
            // UNKNOWN EVENT
            // =====================================================
            default:
                return state;
        }
    }
    // =========================================================
    // CREATE SALE
    // =========================================================
    created(event) {
        const payload = event.payload;
        return {
            id: event.aggregateId,
            businessId: event.businessId,
            branchId: event.branchId,
            productId: payload.productId,
            quantity: payload.quantity,
            price: payload.price,
            costPrice: payload.costPrice,
            total: payload.quantity *
                payload.price,
            userId: event.actor.userId,
            createdAt: event.createdAt,
            updatedAt: event.createdAt
        };
    }
}
exports.SalesReducer = SalesReducer;
