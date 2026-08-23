"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReducer = void 0;
const shared_types_1 = require("@business/shared-types");
/* ------------------------------------------------------------------ */
/*  Reducer                                                           */
/* ------------------------------------------------------------------ */
class SalesReducer {
    reduce(state, event) {
        switch (event.type) {
            case shared_types_1.salesEventType.SALE_ADDED:
                return this.onSaleAdded(event);
            case shared_types_1.salesEventType.SALE_VOIDED:
                return this.onSaleVoided(state, event);
            case shared_types_1.salesEventType.SALE_REFUNDED:
                return this.onSaleRefunded(state, event);
            default:
                if (!state) {
                    throw new Error(`SalesReducer: cannot apply ${event.type} without existing state`);
                }
                return state;
        }
    }
    /* ================================================================ */
    /*  SALE_ADDED                                                      */
    /* ================================================================ */
    onSaleAdded(event) {
        const p = event.payload;
        const quantity = Math.max(0, Math.floor(Number(p.quantity) || 0));
        const unitPrice = Number(p.price) || 0;
        // Normalise cost to line total
        const rawCost = Number(p.costPrice) || 0;
        const lineCost = p.costIsLineTotal
            ? rawCost
            : rawCost * quantity;
        const total = p.total != null
            ? Number(p.total)
            : p.amount != null
                ? Number(p.amount)
                : unitPrice * quantity;
        const profit = total - lineCost;
        const now = event.createdAt ?? Date.now();
        return {
            id: event.aggregateId,
            businessId: event.businessId,
            branchId: event.branchId,
            productId: p.productId,
            productName: p.productName,
            quantity,
            price: unitPrice,
            costPrice: lineCost,
            total,
            profit,
            userId: event.actor?.userId,
            customerId: p.customerId,
            customerRef: p.customerRef,
            invoiceId: p.invoiceId,
            paymentMethod: p.paymentMethod,
            note: p.note,
            status: "completed",
            saleGroupId: p.saleGroupId,
            mode: (p.mode ?? event.mode ?? "LIVE"),
            createdAt: now,
            updatedAt: now,
        };
    }
    /* ================================================================ */
    /*  SALE_VOIDED                                                     */
    /* ================================================================ */
    onSaleVoided(state, event) {
        if (!state) {
            throw new Error(`SalesReducer: SALE_VOIDED requires existing sale (${event.aggregateId})`);
        }
        const now = event.createdAt ?? Date.now();
        return {
            ...state,
            status: "voided",
            note: event.payload?.reason ?? state.note ?? "Voided",
            // Zero financial impact on reports that filter by status
            // Keep original total/cost for audit; summary queries skip voided rows
            updatedAt: now,
        };
    }
    /* ================================================================ */
    /*  SALE_REFUNDED                                                   */
    /* ================================================================ */
    onSaleRefunded(state, event) {
        if (!state) {
            throw new Error(`SalesReducer: SALE_REFUNDED requires existing sale (${event.aggregateId})`);
        }
        const p = event.payload;
        const refundAmount = Math.max(0, Number(p.amount) || 0);
        const refundCost = Math.max(0, Number(p.costPrice) || 0);
        const refundQty = Math.max(0, Math.floor(Number(p.quantity) || 0));
        const now = event.createdAt ?? Date.now();
        // Full refund → mark refunded and zero the line
        // Partial → reduce totals (simple model: one line, one refund state)
        const isFull = refundAmount >= state.total ||
            (refundQty > 0 && refundQty >= state.quantity);
        if (isFull) {
            return {
                ...state,
                status: "refunded",
                note: p.reason ?? state.note ?? "Refunded",
                updatedAt: now,
            };
        }
        // Partial refund: reduce quantity / totals, keep status completed
        // (or set a custom status if you prefer)
        const nextQty = Math.max(0, state.quantity - refundQty);
        const nextTotal = Math.max(0, state.total - refundAmount);
        const nextCost = Math.max(0, state.costPrice - refundCost);
        return {
            ...state,
            quantity: nextQty,
            total: nextTotal,
            costPrice: nextCost,
            profit: nextTotal - nextCost,
            note: p.reason ?? state.note,
            status: nextTotal <= 0 ? "refunded" : state.status,
            updatedAt: now,
        };
    }
}
exports.SalesReducer = SalesReducer;
