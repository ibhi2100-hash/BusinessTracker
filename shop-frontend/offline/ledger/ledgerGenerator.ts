import { Accounts } from "./accounts";
import { financeEventType } from "../events/eventGroups/financeEvent";
import { InventoryEventType } from "../events/eventGroups/inventoryEvents";
import { salesEventType } from "../events/eventGroups/salesEvent";
import { createEntity } from "../entities/entityFactory";

export const generateLedgerEntries = (event: any) => {
const { payload } = event;

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
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: payload.amount
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.REVENUE,
      amount: payload.amount
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.COGS,
      amount: payload.cost
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.INVENTORY,
      amount: -payload.cost
    })

  ];


/**
 * PRODUCT CREATED (Inventory Purchase)
 *
 * Dr Inventory
 * Cr Cash
 */
case InventoryEventType.PRODUCT_CREATED:
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.INVENTORY,
      amount: payload.value
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: -payload.value
    })

  ];


/**
 * ASSET PURCHASE
 *
 * Dr Assets
 * Cr Cash
 */
case financeEventType.ASSET_ADDED:
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.ASSETS,
      amount: payload.cost
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: -payload.cost
    })

  ];


/**
 * ASSET DISPOSAL
 *
 * Dr Cash
 * Cr Asset
 */
case financeEventType.ASSET_DISPOSED:
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: payload.value
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.ASSETS,
      amount: -payload.value
    })

  ];


/**
 * LIABILITY TAKEN
 *
 * Dr Cash
 * Cr Liability
 */
case financeEventType.LIABILITY_ADDED:
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: payload.amount
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.LIABILITIES,
      amount: payload.amount
    })

  ];


/**
 * LIABILITY REPAYMENT
 *
 * Dr Liability
 * Cr Cash
 */
case financeEventType.LIABILITY_REPAYMENT:
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.LIABILITIES,
      amount: -payload.amount
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: -payload.amount
    })

  ];


/**
 * BUSINESS EXPENSE
 *
 * Dr Expense
 * Cr Cash
 */
case financeEventType.EXPENSES_ADDED:
  return [

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.EXPENSES,
      amount: payload.amount
    }),

    createEntity({
      eventId: event.id,
      branchId: event.branchId,
      account: Accounts.CASH,
      amount: -payload.amount
    })

  ];
case financeEventType.CAPITAL_INJECTION:
    return [

    createEntity({
        eventId: event.id,
        branchId: event.branchId,
        account: Accounts.CASH,
        amount: payload.amount
    }),

    createEntity({
        eventId: event.id,
        branchId: event.branchId,
        account: Accounts.OWNER_CAPITAL,
        amount: payload.amount
    })

    ];
    case financeEventType.CAPITAL_DRAWINGS:
return [

createEntity({
  eventId: event.id,
  branchId: event.branchId,
  account: Accounts.OWNER_DRAWINGS,
  amount: payload.amount
}),

createEntity({
  eventId: event.id,
  branchId: event.branchId,
  account: Accounts.CASH,
  amount: -payload.amount
})


];

case financeEventType.BRANCH_TRANSFER_OUT:
return [
    
createEntity({
  eventId: event.id,
  branchId: event.branchId,
  account: Accounts.CASH,
  amount: -payload.amount
}),

createEntity({
  eventId: event.id,
  branchId: event.branchId,
  account: Accounts.INTER_BRANCH,
  amount: payload.amount
})


];

case financeEventType.BRANCH_TRANSFER_IN:
return [

createEntity({
  eventId: event.id,
  branchId: payload.toBranchId,
  account: Accounts.CASH,
  amount: payload.amount
}),

createEntity({
  eventId: event.id,
  branchId: payload.toBranchId,
  account: Accounts.INTER_BRANCH,
  amount: -payload.amount
})

];




default:
  return [];

}
};
