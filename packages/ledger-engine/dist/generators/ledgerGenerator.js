"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLedgerEntries = generateLedgerEntries;
const shared_types_1 = require("@business/shared-types");
const shared_types_2 = require("@business/shared-types");
function buildEntry(event, index, account, direction, amount) {
    if (!event.businessId || !event.branchId) {
        throw new Error(`Ledger generation requires businessId and branchId. Event: ${event.id}`);
    }
    if (!Number.isFinite(amount)) {
        throw new Error(`Invalid amount for ${event.type}: ${amount}`);
    }
    return {
        id: `${event.id}-${index}`, // ✅ deterministic
        eventId: event.id,
        businessId: event.businessId,
        branchId: event.branchId,
        type: event.type,
        account,
        direction,
        amount, // ✅ ALWAYS POSITIVE
        index,
        createdAt: event.createdAt.getTime(), // ✅ timestamp in ms
    };
}
function generateLedgerEntries(event) {
    const { payload } = event;
    let entries = [];
    switch (event.type) {
        /**
         * SALE
         * Dr Cash
         * Cr Revenue
         * Dr COGS
         * Cr Inventory
         */
        case shared_types_2.salesEventType.SALE_ADDED:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.REVENUE, "CREDIT", payload.amount),
                buildEntry(event, 2, shared_types_1.Account.COGS, "DEBIT", payload.costPrice),
                buildEntry(event, 3, shared_types_1.Account.INVENTORY, "CREDIT", payload.costPrice),
            ];
            break;
        /**
         * INVENTORY (Opening or Purchase)
         */
        case shared_types_2.OpeningEventType.OPENING_INVENTORY_CREATED: {
            const value = payload.costPrice * payload.quantity;
            if (event.mode === "OPENING") {
                // ✅ Opening balance — no cash movement
                entries = [
                    buildEntry(event, 0, shared_types_1.Account.INVENTORY, "DEBIT", value),
                    buildEntry(event, 1, shared_types_1.Account.OWNER_CAPITAL, "CREDIT", value),
                ];
            }
            else {
                // ✅ Live purchase
                entries = [
                    buildEntry(event, 0, shared_types_1.Account.INVENTORY, "DEBIT", value),
                    buildEntry(event, 1, shared_types_1.Account.CASH, "CREDIT", value),
                ];
            }
            break;
        }
        case shared_types_2.InventoryEventType.PRODUCT_CREATED:
            return []; // ✅ NO financial impact
        /**
         * OPENING CAPITAL
         * Dr Cash
         * Cr Owner Capital
         */
        case shared_types_2.financeEventType.OPENING_CAPITAL:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.OWNER_CAPITAL, "CREDIT", payload.amount),
            ];
            break;
        /**
         * OPENING CAPITAL
         * Dr Cash
         * Cr Owner Capital
         */
        case shared_types_2.financeEventType.CASH_ADDED:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.OWNER_CAPITAL, "CREDIT", payload.amount),
            ];
            break;
        /**
         * ASSET PURCHASE
         * Dr Fixed Assets
         * Cr Cash
         */
        case shared_types_2.financeEventType.ASSET_ADDED:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.FIXED_ASSETS, "DEBIT", payload.cost),
                buildEntry(event, 1, shared_types_1.Account.CASH, "CREDIT", payload.cost),
            ];
            break;
        /**
         * ASSET DISPOSAL
         * Dr Cash
         * Cr Fixed Assets
         */
        case shared_types_2.financeEventType.ASSET_DISPOSED:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.value),
                buildEntry(event, 1, shared_types_1.Account.FIXED_ASSETS, "CREDIT", payload.value),
            ];
            break;
        /**
         * LIABILITY ADDED
         * Dr Cash
         * Cr Liabilities
         */
        case shared_types_2.financeEventType.LIABILITY_ADDED:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.principalAmount),
                buildEntry(event, 1, shared_types_1.Account.LIABILITIES, "CREDIT", payload.principalAmount),
            ];
            break;
        /**
         * LIABILITY REPAYMENT
         * Dr Liabilities
         * Cr Cash
         */
        case shared_types_2.financeEventType.LIABILITY_REPAYMENT:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.LIABILITIES, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.CASH, "CREDIT", payload.amount),
            ];
            break;
        /**
         * EXPENSE
         * Dr Expense
         * Cr Cash
         */
        case shared_types_2.financeEventType.EXPENSES_ADDED:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.EXPENSE, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.CASH, "CREDIT", payload.amount),
            ];
            break;
        /**
         * CAPITAL INJECTION
         * Dr Cash
         * Cr Owner Capital
         */
        case shared_types_2.financeEventType.CAPITAL_INJECTION:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.OWNER_CAPITAL, "CREDIT", payload.amount),
            ];
            break;
        /**
         * OWNER DRAWINGS
         * Dr Drawings
         * Cr Cash
         */
        case shared_types_2.financeEventType.CAPITAL_DRAWINGS:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.OWNER_DRAWINGS, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.CASH, "CREDIT", payload.amount),
            ];
            break;
        /**
         * TRANSFER OUT
         * Dr Inter-Branch
         * Cr Cash
         */
        case shared_types_2.financeEventType.BRANCH_TRANSFER_OUT:
            entries = [
                buildEntry(event, 0, shared_types_1.Account.INTER_BRANCH, "DEBIT", payload.amount),
                buildEntry(event, 1, shared_types_1.Account.CASH, "CREDIT", payload.amount),
            ];
            break;
        /**
         * TRANSFER IN
         * Dr Cash
         * Cr Inter-Branch
         */
        case shared_types_2.financeEventType.BRANCH_TRANSFER_IN:
            entries = [
                {
                    ...buildEntry(event, 0, shared_types_1.Account.CASH, "DEBIT", payload.amount),
                    branchId: payload.toBranchId, // ✅ override
                },
                {
                    ...buildEntry(event, 1, shared_types_1.Account.INTER_BRANCH, "CREDIT", payload.amount),
                    branchId: payload.toBranchId,
                },
            ];
            break;
        default:
            return [];
    }
    // ✅ SAFETY: enforce balance
    const totalDebit = entries
        .filter(e => e.direction === "DEBIT")
        .reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = entries
        .filter(e => e.direction === "CREDIT")
        .reduce((sum, e) => sum + e.amount, 0);
    if (totalDebit !== totalCredit) {
        throw new Error(`Unbalanced ledger for event ${event.type}: Dr ${totalDebit} !== Cr ${totalCredit}`);
    }
    return entries;
}
