"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductReducer = void 0;
const shared_types_1 = require("@business/shared-types");
class ProductReducer {
    reduce(state, event) {
        switch (event.type) {
            // =====================================================
            // CREATE PRODUCT
            // =====================================================
            case shared_types_1.InventoryEventType.PRODUCT_CREATED:
                return this.created(event);
            // =====================================================
            // UPDATE PRODUCT
            // =====================================================
            case shared_types_1.InventoryEventType.PRODUCT_UPDATED:
                return this.update(state, event);
            // =====================================================
            // DELETE PRODUCT
            // =====================================================
            case shared_types_1.InventoryEventType.PRODUCT_DELETED:
                return this.deleted(state, event);
            // =====================================================
            // INVENTORY RECEIVED
            // =====================================================
            case shared_types_1.InventoryEventType.INVENTORY_RECEIVED:
                return this.inventoryReceived(state, event);
            // =====================================================
            // UNKNOWN EVENT
            // =====================================================
            default:
                return state;
        }
    }
    // =========================================================
    // CREATE
    // =========================================================
    created(event) {
        const payload = event.payload;
        return {
            id: event.aggregateId,
            name: payload.name,
            price: payload.price,
            costPrice: payload.costPrice,
            imageUrl: payload.imageUrl,
            description: payload.description,
            businessId: event.businessId ??
                undefined,
            branchId: event.branchId ??
                undefined,
            isActive: true,
            isDeleted: false,
            createdAt: event.createdAt,
            updatedAt: event.createdAt
        };
    }
    // =========================================================
    // UPDATE
    // =========================================================
    update(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        return {
            ...state,
            name: payload.name,
            price: payload.price,
            costPrice: payload.costPrice,
            imageUrl: payload.imageUrl ??
                state.imageUrl,
            description: payload.description ??
                state.description,
            updatedAt: event.createdAt
        };
    }
    // =========================================================
    // DELETE
    // =========================================================
    deleted(current, event) {
        const state = this.requireState(current, event);
        return {
            ...state,
            isActive: false,
            isDeleted: true,
            deletedAt: event.createdAt,
            updatedAt: event.createdAt
        };
    }
    // =========================================================
    // INVENTORY RECEIVED
    // =========================================================
    inventoryReceived(current, event) {
        const state = this.requireState(current, event);
        const payload = event.payload;
        const newCost = payload.costPrice;
        // No projection change required.
        if (newCost ===
            state.costPrice) {
            return state;
        }
        return {
            ...state,
            costPrice: newCost,
            updatedAt: event.createdAt
        };
    }
    // =========================================================
    // STATE GUARD
    // =========================================================
    requireState(state, event) {
        if (!state) {
            throw new Error(`Product projection not found for aggregate ` +
                `${event.aggregateId}. ` +
                `Cannot apply event ${event.type}.`);
        }
        return state;
    }
}
exports.ProductReducer = ProductReducer;
