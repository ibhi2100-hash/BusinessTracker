"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryReducer = void 0;
const shared_types_1 = require("@business/shared-types");
class InventoryReducer {
    reduce(state, event) {
        switch (event.type) {
            // =========================
            // OPENING STOCK
            // =========================
            case shared_types_1.OpeningEventType.OPENING_INVENTORY_CREATED:
                return this.created(event);
            // =========================
            // STOCK ADDED
            // =========================
            case shared_types_1.InventoryEventType.INVENTORY_ADDED:
                return this.add(event);
            // =========================
            // STOCK UPDATED
            // =========================
            case shared_types_1.InventoryEventType.INVENTORY_UPDATED:
                return this.update(state, event);
            // =========================
            // STOCK RECEIVED
            // =========================
            case shared_types_1.InventoryEventType.INVENTORY_RECEIVED:
                return this.receive(state, event);
            // =========================
            // STOCK ADJUSTED
            // =========================
            case shared_types_1.InventoryEventType.INVENTORY_ADJUSTED:
                return this.adjust(state, event);
            // =========================
            // STOCK TRANSFERRED
            // =========================
            case shared_types_1.InventoryEventType.INVENTORY_TRANSFER:
                return this.transfer(state, event);
            // =========================
            // SALE
            // =========================
            case shared_types_1.salesEventType.SALE_ADDED:
                return this.sell(state, event);
            default:
                return state;
        }
    }
    // =====================================================
    // CREATE
    // =====================================================
    created(event) {
        const payload = event.payload;
        return {
            id: event.aggregateId,
            productId: payload.productId,
            businessId: event.businessId,
            branchId: event.branchId,
            quantity: payload.quantity,
            costPrice: payload.costPrice,
            createdAt: event.createdAt,
            updatedAt: event.createdAt
        };
    }
    // =====================================================
    // ADD STOCK
    // =====================================================
    add(event) {
        const payload = event.payload;
        return {
            id: payload.id,
            productId: payload.productId,
            branchId: event.branchId,
            businessId: event.businessId,
            quantity: payload.quantity,
            costPrice: payload.costPrice,
            createdAt: event.createdAt
        };
    }
    // =====================================================
    // UPDATE STOCK
    // =====================================================
    update(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        return {
            ...state,
            quantity: state.quantity +
                payload.quantity,
            updatedAt: event.createdAt
        };
    }
    // =====================================================
    // RECEIVE STOCK
    // =====================================================
    receive(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        return {
            ...state,
            quantity: state.quantity +
                payload.quantity,
            costPrice: payload.costPrice,
            updatedAt: event.createdAt
        };
    }
    // =====================================================
    // ADJUST STOCK
    // =====================================================
    adjust(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        const quantity = payload.direction === "increase"
            ? state.quantity +
                payload.quantity
            : state.quantity -
                payload.quantity;
        return {
            ...state,
            quantity,
            updatedAt: event.createdAt
        };
    }
    // =====================================================
    // TRANSFER STOCK
    // =====================================================
    transfer(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        return {
            ...state,
            quantity: state.quantity -
                payload.quantity,
            updatedAt: event.createdAt
        };
    }
    // =====================================================
    // SALE
    // =====================================================
    sell(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        return {
            ...state,
            quantity: state.quantity -
                payload.quantity,
            updatedAt: event.createdAt
        };
    }
    // =====================================================
    // STATE GUARD
    // =====================================================
    requireState(state, event) {
        if (!state) {
            throw new Error(`Inventory projection not found for aggregate ${event.aggregateId}. ` +
                `Cannot apply event ${event.type}.`);
        }
        return state;
    }
}
exports.InventoryReducer = InventoryReducer;
