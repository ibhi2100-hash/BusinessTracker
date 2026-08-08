"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryReducer = void 0;
const shared_types_1 = require("@business/shared-types");
const shared_types_2 = require("@business/shared-types");
const shared_types_3 = require("@business/shared-types");
class InventoryReducer {
    reduce(state, event) {
        switch (event.type) {
            // =========================
            // OPENING STOCK
            // =========================
            case shared_types_1.OpeningEventType.OPENING_INVENTORY_CREATED:
                return {
                    id: event.aggregateId,
                    productId: event.payload.productId,
                    businessId: event.businessId,
                    branchId: event.branchId,
                    quantity: event.payload.quantity,
                    costPrice: event.payload.costPrice,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK INCREMENT
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_ADDED:
                if (!state)
                    return state;
                return {
                    ...state,
                    quantity: state.quantity +
                        event.payload.quantity,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK ADJUSTMENT
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_UPDATED:
                if (!state)
                    return state;
                return {
                    ...state,
                    quantity: state.quantity +
                        event.payload.quantity,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK RECEIVED
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_RECEIVED:
                if (!state)
                    return state;
                return {
                    ...state,
                    quantity: state.quantity +
                        event.payload.quantity,
                    costPrice: event.payload.costPrice,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK ADJUSTMENT
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_ADJUSTED:
                if (!state)
                    return state;
                return {
                    ...state,
                    quantity: event.payload.direction === "increase"
                        ? state.quantity + event.payload.quantity
                        : state.quantity - event.payload.quantity,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK TRANSFER
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_TRANSFER:
                if (!state)
                    return state;
                return {
                    ...state,
                    quantity: state.quantity -
                        event.payload.quantity,
                    updatedAt: event.createdAt,
                };
            // =========================
            // SALE
            // =========================
            case shared_types_3.salesEventType.SALE_ADDED:
                if (!state)
                    return state;
                return {
                    ...state,
                    quantity: state.quantity -
                        event.payload.quantity,
                    updatedAt: event.createdAt,
                };
            default:
                return state;
        }
    }
}
exports.InventoryReducer = InventoryReducer;
