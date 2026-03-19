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
case "SALE_ADDED":
    return [  ];


/**
 * PRODUCT CREATED (Inventory Purchase)
 *
 * Dr Inventory
 * Cr Cash
 */
case "PRODUCT_CREATED":
    return [];


/**
 * ASSET PURCHASE
 *
 * Dr Assets
 * Cr Cash
 */
case "ASSET_ADDED":
    return [ ];


/**
 * ASSET DISPOSAL
 *
 * Dr Cash
 * Cr Asset
 */
case "ASSET_DISPOSED":
    return [];


/**
 * LIABILITY TAKEN
 *
 * Dr Cash
 * Cr Liability
 */
case "LIABILITY_ADDED":
    return [];


/**
 * LIABILITY REPAYMENT
 *
 * Dr Liability
 * Cr Cash
 */
case "LIABILITY_REPAYMENT":
    return [ ];


/**
 * BUSINESS EXPENSE
 *
 * Dr Expense
 * Cr Cash
 */
case "EXPENSES_ADDED":
    return [ ];

case "CAPITAL_INJECTION":
    return [ ];

case "CAPITAL_WITHDRAWAL":
    return [];

case "BRANCH_TRANSFER_OUT":
    return [];

case "BRANCH_TRANSFER_IN":
    return [];




default:
  return [];

}
};
