
export function dashboardReducer(state: any , event: any) {
    switch (event.type){
        case "SALE_ADDED":
            return {
                ...state,
                cashAtHand: state.cashAtHand + event.payload.amount,
                todaySales: state.todaySales + event.payload.amount,
                inventoryValue: state.inventoryValue - event.payload.cost,
                profit: state.profit + (event.payload.amount - event.payload.cost)
            }

        case "INVENTORY_ADDED":
            return {
                ...state,
                inventoryValue: state.inventoryValue + event.payload.amount,
                cashAtHand: state.cashAtHand - event.payload.amount
            }
        case "ASSET_ADDED":
            return {
                ...state,
                assetValue: state.assetValue + event.payload.amount,
                cashAtHand: state.cashAtHand - event.payload.amount
            }

        case "ASSET_DISPOSED":
            return {
                ...state,
                assetValue: state.assetValue - event.payload.amount,
                cashAtHand: state.cashAtHand + event.payload.amount
            }
        case "LIABILITY_ADDED":
            return {
                ...state,
                liabilityValue: state.liabilityValue + event.payload.amount,
                cashAtHand: state.cashAtHand + event.payload.amount 
            }
        case "LIABILITY_REPAYMENT":
            return {
                ...state,
                liabilityValue: state.liabilityValue - event.payload.amount,
                cashAtHand: state.cashAtHand - event.payload.amount
            }
        case "EXPENSES_ADDED":
            return {
                ...state,
                cashAtHand: state.cashAtHand - event.payload.amount
            }
        default:
            return state
    }
}