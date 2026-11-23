export class RefundReducer {
    reduce(_state, event) {
        if (event.type !== "REFUND_COMPLETED") {
            throw new Error(`RefundReducer: unsupported event ${event.type}`);
        }
        const p = event.payload;
        if (!p.refundId || p.refundId !== event.aggregateId) {
            throw new Error("REFUND_COMPLETED requires payload.refundId to equal aggregateId");
        }
        if (!p.originalSaleId)
            throw new Error("Refund requires originalSaleId");
        if (!Number.isFinite(p.totalAmount) || p.totalAmount <= 0) {
            throw new Error(`Invalid refund total: ${p.totalAmount}`);
        }
        const now = event.createdAt ?? Date.now();
        const items = p.items.map(item => {
            if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
                throw new Error(`Invalid refunded quantity for product ${item.productId}`);
            }
            if (!Number.isFinite(item.lineRefundAmount) || item.lineRefundAmount < 0) {
                throw new Error(`Invalid refund amount for product ${item.productId}`);
            }
            return {
                id: item.id,
                refundId: p.refundId,
                businessId: event.businessId,
                branchId: event.branchId,
                originalSaleId: p.originalSaleId,
                saleItemId: item.saleItemId ?? null,
                productId: item.productId,
                productName: item.productName ?? null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitCostPrice: item.unitCostPrice,
                lineRefundAmount: item.lineRefundAmount,
                lineCostAmount: item.lineCostAmount,
                inventoryDisposition: item.inventoryDisposition,
                createdAt: now,
            };
        });
        const payments = p.payments.map(payment => ({
            id: payment.id,
            refundId: p.refundId,
            businessId: event.businessId,
            branchId: event.branchId,
            paymentMethod: payment.paymentMethod,
            amount: payment.amount,
            status: payment.status,
            reference: payment.reference ?? null,
            createdAt: now,
            completedAt: payment.completedAt ?? null,
        }));
        const paymentTotal = payments
            .filter(x => x.status === "COMPLETED")
            .reduce((sum, x) => sum + x.amount, 0);
        if (paymentTotal > p.totalAmount + 0.000001) {
            throw new Error("Completed refund payments exceed refund total");
        }
        return {
            id: p.refundId,
            businessId: event.businessId,
            branchId: event.branchId,
            originalSaleId: p.originalSaleId,
            refundNumber: p.refundNumber,
            customerId: p.customerId ?? null,
            customerRef: p.customerRef ?? null,
            reason: p.reason ?? null,
            status: p.status,
            refundMethod: p.refundMethod ?? null,
            subtotal: p.subtotal,
            taxAmount: p.taxAmount ?? 0,
            totalAmount: p.totalAmount,
            userId: p.userId ?? event.actor?.userId ?? null,
            approvedBy: p.approvedBy ?? null,
            mode: p.mode ?? event.mode ?? "LIVE",
            createdAt: now,
            completedAt: now,
            updatedAt: now,
            items,
            payments,
        };
    }
}
