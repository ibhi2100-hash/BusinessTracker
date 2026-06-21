import { Account, LedgerEntry, IntegrationEvent } from "@business/shared-types"
import { OpeningEventType, salesEventType, financeEventType, InventoryEventType,  } from "@business/shared-types"

type Direction = "DEBIT" | "CREDIT";

function buildEntry(
  event: IntegrationEvent,
  index: number,
  account: Account,
  direction: Direction,
  amount: number
): LedgerEntry {
  if (!event.businessId || !event.branchId) {
  throw new Error(
    `Ledger generation requires businessId and branchId. Event: ${event.id}`
  );
}
 if (!Number.isFinite(amount)) {
  throw new Error(
    `Invalid amount for ${event.type}: ${amount}`
  );
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

export function generateLedgerEntries(event: IntegrationEvent): LedgerEntry[] {
  const { payload } = event;

  let entries: LedgerEntry[] = [];

  switch (event.type) {

    /**
     * SALE
     * Dr Cash
     * Cr Revenue
     * Dr COGS
     * Cr Inventory
     */
    case salesEventType.SALE_ADDED:
      entries = [
        buildEntry(event, 0, Account.CASH, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.REVENUE, "CREDIT", payload.amount),

        buildEntry(event, 2, Account.COGS, "DEBIT", payload.costPrice),
        buildEntry(event, 3, Account.INVENTORY, "CREDIT", payload.costPrice),
      ];
      break;

    /**
     * INVENTORY (Opening or Purchase)
     */
    case OpeningEventType.OPENING_INVENTORY_CREATED: {
      const value = payload.costPrice * payload.quantity;

      if (event.mode === "OPENING") {
        // ✅ Opening balance — no cash movement
        entries = [
          buildEntry(event, 0, Account.INVENTORY, "DEBIT", value),
          buildEntry(event, 1, Account.OWNER_CAPITAL, "CREDIT", value),
        ];
      } else {
        // ✅ Live purchase
        entries = [
          buildEntry(event, 0, Account.INVENTORY, "DEBIT", value),
          buildEntry(event, 1, Account.CASH, "CREDIT", value),
        ];
      }

      break;
    }

    /**
     * INVENTORY RECEIVED
     */
    case InventoryEventType.INVENTORY_RECEIVED: {
      const value = payload.costPrice * payload.quantity;

      if (event.mode === "OPENING") {
        // ✅ Opening balance — no cash movement
        entries = [
          buildEntry(event, 0, Account.INVENTORY, "DEBIT", value),
          buildEntry(event, 1, Account.OWNER_CAPITAL, "CREDIT", value),
        ];
      } else {
        // ✅ Live purchase
        entries = [
          buildEntry(event, 0, Account.INVENTORY, "DEBIT", value),
          buildEntry(event, 1, Account.CASH, "CREDIT", value),
        ];
      }

      break;
    }

    /**
     * INVENTORY (Opening or Purchase)
     */
    case InventoryEventType.INVENTORY_ADJUSTED: {
      const value = payload.costPrice * payload.quantity;

      if (event.mode === "OPENING") {
        // ✅ Opening balance — no cash movement
        entries = [
          buildEntry(event, 0, Account.INVENTORY, "DEBIT", value),
          buildEntry(event, 1, Account.OWNER_CAPITAL, "CREDIT", value),
        ];
      } else {
        // ✅ Live purchase
        entries = [
          buildEntry(event, 0, Account.INVENTORY, "DEBIT", value),
          buildEntry(event, 1, Account.CASH, "CREDIT", value),
        ];
      }

      break;
    }
    case InventoryEventType.PRODUCT_CREATED:
      return []; // ✅ NO financial impact
    /**
     * OPENING CAPITAL
     * Dr Cash
     * Cr Owner Capital
     */
    case financeEventType.OPENING_CAPITAL:
      entries = [
        buildEntry(event, 0, Account.CASH, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.OWNER_CAPITAL, "CREDIT", payload.amount),
      ];
      break;

    /**
     * OPENING CAPITAL
     * Dr Cash
     * Cr Owner Capital
     */
    case financeEventType.CASH_ADDED:
      entries = [
        buildEntry(event, 0, Account.CASH, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.OWNER_CAPITAL, "CREDIT", payload.amount),
      ];
      break;

    /**
     * ASSET PURCHASE
     * Dr Fixed Assets
     * Cr Cash
     */
    case financeEventType.ASSET_ADDED:
      entries = [
        buildEntry(event, 0, Account.FIXED_ASSETS, "DEBIT", payload.cost),
        buildEntry(event, 1, Account.CASH, "CREDIT", payload.cost),
      ];
      break;

    /**
     * ASSET DISPOSAL
     * Dr Cash
     * Cr Fixed Assets
     */
    case financeEventType.ASSET_DISPOSED:
      entries = [
        buildEntry(event, 0, Account.CASH, "DEBIT", payload.value),
        buildEntry(event, 1, Account.FIXED_ASSETS, "CREDIT", payload.value),
      ];
      break;

    /**
     * LIABILITY ADDED
     * Dr Cash
     * Cr Liabilities
     */
    case financeEventType.LIABILITY_ADDED:
      entries = [
        buildEntry(event, 0, Account.CASH, "DEBIT", payload.principalAmount),
        buildEntry(event, 1, Account.LIABILITIES, "CREDIT", payload.principalAmount),
      ];
      break;

    /**
     * LIABILITY REPAYMENT
     * Dr Liabilities
     * Cr Cash
     */
    case financeEventType.LIABILITY_REPAYMENT:
      entries = [
        buildEntry(event, 0, Account.LIABILITIES, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.CASH, "CREDIT", payload.amount),
      ];
      break;

    /**
     * EXPENSE
     * Dr Expense
     * Cr Cash
     */
    case financeEventType.EXPENSES_ADDED:
      entries = [
        buildEntry(event, 0, Account.EXPENSE, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.CASH, "CREDIT", payload.amount),
      ];
      break;

    /**
     * CAPITAL INJECTION
     * Dr Cash
     * Cr Owner Capital
     */
    case financeEventType.CAPITAL_INJECTION:
      entries = [
        buildEntry(event, 0, Account.CASH, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.OWNER_CAPITAL, "CREDIT", payload.amount),
      ];
      break;

    /**
     * OWNER DRAWINGS
     * Dr Drawings
     * Cr Cash
     */
    case financeEventType.CAPITAL_DRAWINGS:
      entries = [
        buildEntry(event, 0, Account.OWNER_DRAWINGS, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.CASH, "CREDIT", payload.amount),
      ];
      break;

    /**
     * TRANSFER OUT
     * Dr Inter-Branch
     * Cr Cash
     */
    case financeEventType.BRANCH_TRANSFER_OUT:
      entries = [
        buildEntry(event, 0, Account.INTER_BRANCH, "DEBIT", payload.amount),
        buildEntry(event, 1, Account.CASH, "CREDIT", payload.amount),
      ];
      break;

    /**
     * TRANSFER IN
     * Dr Cash
     * Cr Inter-Branch
     */
    case financeEventType.BRANCH_TRANSFER_IN:
      entries = [
        {
          ...buildEntry(event, 0, Account.CASH, "DEBIT", payload.amount),
          branchId: payload.toBranchId, // ✅ override
        },
        {
          ...buildEntry(event, 1, Account.INTER_BRANCH, "CREDIT", payload.amount),
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
    throw new Error(
      `Unbalanced ledger for event ${event.type}: Dr ${totalDebit} !== Cr ${totalCredit}`
    );
  }

  return entries;
}