"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleReducer = void 0;
const shared_types_1 = require("@business/shared-types");
exports.SaleReducer = {
    reduce(current, event) {
        switch (event.type) {
            case shared_types_1.salesEventType.SALE_ADDED:
                return {
                    id: event.payload.id,
                    sellingPrice: event.payload.sellingPrice,
                    costPrice: event.payload.costPrice,
                    productId: event.payload.productId,
                    businessId: event.businessId ?? undefined,
                    branchId: event.branchId ?? undefined,
                    createdAt: new Date(event.createdAt),
                    updatedAt: new Date(event.createdAt),
                };
            default:
                return current;
        }
    }
};
