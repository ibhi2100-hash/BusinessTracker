"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryReducer = void 0;
const shared_types_1 = require("@business/shared-types");
const shared_types_2 = require("@business/shared-types");
const shared_types_3 = require("@business/shared-types");
exports.InventoryReducer = {
    initialState: () => ({
        id: "",
        productId: "",
        branchId: "",
        businessId: "",
        quantity: 0,
        costPrice: 0,
    }),
    reduce(current, event) {
        switch (event.type) {
            // =========================
            // OPENING STOCK
            // =========================
            case shared_types_1.OpeningEventType.OPENING_INVENTORY_CREATED:
                return {
                    id: event.aggregateId,
                    aggregateId: event.aggregateId,
                    aggregateType: event.aggregateType,
                    productId: event.payload.productId,
                    branchId: event.branchId,
                    quantity: event.payload.quantity,
                    costPrice: event.payload.costPrice,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK INCREMENT
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_ADDED:
                if (!current)
                    return current;
                return {
                    ...current,
                    quantity: current.quantity +
                        event.payload.quantityDelta,
                    updatedAt: event.createdAt,
                };
            // =========================
            // STOCK ADJUSTMENT
            // =========================
            case shared_types_2.InventoryEventType.INVENTORY_UPDATED:
                console.log("Current inventory:", current);
                console.log("Incoming event:", event);
                if (!current)
                    return current;
                return {
                    ...current,
                    quantity: current.quantity +
                        event.payload.quantityDelta,
                    updatedAt: event.createdAt,
                };
            // =========================
            // SALE
            // =========================
            case shared_types_3.salesEventType.SALE_ADDED:
                if (!current)
                    return current;
                return {
                    ...current,
                    quantity: current.quantity -
                        event.payload.quantity,
                    updatedAt: event.createdAt,
                };
            default:
                return current;
        }
    }
};
