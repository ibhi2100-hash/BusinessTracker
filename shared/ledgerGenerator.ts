import { Account } from "../shop-frontend/offline/features/ledger/accounts";
import { financeEventType } from "../shop-frontend/offline/core/events/eventGroups/financeEvent";
import { InventoryEventType } from "../shop-frontend/offline/core/events/eventGroups/inventoryEvents";
import { salesEventType } from "../shop-frontend/offline/core/events/eventGroups/salesEvent";

type LedgerEntryInput = {
  id: string;
  eventId: string;
  branchId: string;
  account: Account;
  amount: number;
  index: number;
};

function buildEntry(
  eventId: string,
  branchId: string,
  index: number,
  account: Account,
  amount: number
): LedgerEntryInput {
  return {
    id: `${eventId}-${index}`, // ✅ deterministic
    eventId,
    branchId,
    account,
    amount,
    index
  };
}

export function generateLedgerEntries(event: any): LedgerEntryInput[] {
  const { payload } = event;

  let entries: LedgerEntryInput[] = [];

  switch (event.type) {

    /**
     * SALE EVENT
     * Dr Cash
     * Cr Revenue
     *
     * Dr COGS
     * Cr Inventory
     */
    case salesEventType.SALE_ADDED:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.CASH, payload.amount),
        buildEntry(event.id, event.branchId, 1, Account.REVENUE, -payload.amount),

        buildEntry(event.id, event.branchId, 2, Account.COGS, payload.cost),
        buildEntry(event.id, event.branchId, 3, Account.INVENTORY, -payload.cost)
      ];
      break;

    /**
     * INVENTORY PURCHASE
     * Dr Inventory
     * Cr Cash
     */
    case InventoryEventType.PRODUCT_CREATED:
      const value = payload.costPrice * payload.quantity;
      const mode = payload.stockMode;
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.INVENTORY, value),
        ...(mode === "PURCHASE"
          ? [buildEntry(event.id, event.branchId, 1, Account.CASH, -value)]
          : []),
      ];
      break;

    case financeEventType.OPENING_CAPITAL:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.CASH, payload.amount),
      ];
      break;

    /**
     * ASSET PURCHASE
     * Dr Assets
     * Cr Cash
     */
    case financeEventType.ASSET_ADDED:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.FIXED_ASSETS, payload.cost),
        buildEntry(event.id, event.branchId, 1, Account.CASH, -payload.cost)
      ];
      break;

    /**
     * ASSET DISPOSAL
     * Dr Cash
     * Cr Assets
     */
    case financeEventType.ASSET_DISPOSED:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.CASH, payload.value),
        buildEntry(event.id, event.branchId, 1, Account.FIXED_ASSETS, -payload.value)
      ];
      break;

    /**
     * LIABILITY TAKEN
     * Dr Cash
     * Cr Liability
     */
    case financeEventType.LIABILITY_ADDED:
      const amount = payload.principalAmount
      const liabilitymode = payload.liabilityType;
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.LIABILITIES, amount),
         ...(liabilitymode === "LIVE"
          ? [buildEntry(event.id, event.branchId, 1, Account.CASH, amount)]
          : []),
      ];
      break;

    /**
     * LIABILITY REPAYMENT
     * Dr Liability
     * Cr Cash
     */
    case financeEventType.LIABILITY_REPAYMENT:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.LIABILITIES, payload.amount),
        buildEntry(event.id, event.branchId, 1, Account.CASH, -payload.amount)
      ];
      break;

    /**
     * BUSINESS EXPENSE
     * Dr Expense
     * Cr Cash
     */
    case financeEventType.EXPENSES_ADDED:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.EXPENSES, payload.amount),
        buildEntry(event.id, event.branchId, 1, Account.CASH, -payload.amount)
      ];
      break;

    /**
     * CAPITAL INJECTION
     * Dr Cash
     * Cr Owner Capital
     */
    case financeEventType.CAPITAL_INJECTION:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.CASH, payload.amount),
        buildEntry(event.id, event.branchId, 1, Account.OWNER_CAPITAL, -payload.amount)
      ];
      break;

    /**
     * OWNER DRAWINGS
     * Dr Drawings
     * Cr Cash
     */
    case financeEventType.CAPITAL_DRAWINGS:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.OWNER_DRAWINGS, payload.amount),
        buildEntry(event.id, event.branchId, 1, Account.CASH, -payload.amount)
      ];
      break;

    /**
     * BRANCH TRANSFER OUT
     * Dr Inter-Branch
     * Cr Cash
     */
    case financeEventType.BRANCH_TRANSFER_OUT:
      entries = [
        buildEntry(event.id, event.branchId, 0, Account.INTER_BRANCH, payload.amount),
        buildEntry(event.id, event.branchId, 1, Account.CASH, -payload.amount)
      ];
      break;

    /**
     * BRANCH TRANSFER IN
     * Dr Cash
     * Cr Inter-Branch
     */
    case financeEventType.BRANCH_TRANSFER_IN:
      entries = [
        buildEntry(event.id, payload.toBranchId, 0, Account.CASH, payload.amount),
        buildEntry(event.id, payload.toBranchId, 1, Account.INTER_BRANCH, -payload.amount)
      ];
      break;

    default:
      return [];
  }

  return entries;
}