import { Accounts } from "./accounts";
import { EventTypes } from "../events/eventTypes";

export const generateLedgerEntries = (event: any)=> {
    const { payload } = event

    switch(event.type) {
        case EventTypes.SALE_ADDED:
            return [
                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.REVENUE,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.COGS,
                    amount: payload.cost,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.INVENTORY,
                    amount: -payload.cost,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.EXPENSES,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.LIABILITIES,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.ASSETS,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },
            ]

        case EventTypes.INVENTORY_ADDED:
            return [
                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.INVENTORY,
                    amount: payload.value,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: -payload.value,
                    timestamp: event.timestamp
                },
            ]
        case EventTypes.ASSET_ADDED:
            return [
                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.ASSETS,
                    amount: payload.cost,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: -payload.cost,
                    timestamp: event.timestamp
                },
            ]
            
        case EventTypes.ASSET_DISPOSED:
            return [
                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.COGS,
                    amount: -payload.value,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: payload.value,
                    timestamp: event.timestamp
                },
            ]

        case EventTypes.LIABILITY_ADDED:
            return [
                    {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.LIABILITIES,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },
            ]

        case EventTypes.LIABILITY_REPAYMENT:
            return [
                    {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.LIABILITIES,
                    amount: -payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: -payload.amount,
                    timestamp: event.timestamp
                },
            ]  
        case EventTypes.EXPENSES_ADDED:
            return [
                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.EXPENSES,
                    amount: payload.amount,
                    timestamp: event.timestamp
                },

                {
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    account: Accounts.CASH,
                    amount: -payload.amount,
                    timestamp: event.timestamp
                },
            ]  
    }
}