import {
    Inventory,
    OpeningEventType,
    InventoryEventType,
    salesEventType,
    DomainEvent
} from "@business/shared-types";

import { ProjectionReducer } from "../contracts/ProjectionReducer";

interface InventoryPayload {
    id: string;
    productId: string;
    quantity: number;
    costPrice: number;
    direction?: "increase" | "decrease";
}

export class InventoryReducer
implements ProjectionReducer<Inventory, DomainEvent> {

    reduce(
        state: Inventory | null,
        event: DomainEvent
    ): Inventory {

        switch (event.type) {

            // =========================
            // OPENING STOCK
            // =========================

            case OpeningEventType.OPENING_INVENTORY_CREATED:

                return this.created(event);


            // =========================
            // STOCK ADDED
            // =========================

            case InventoryEventType.INVENTORY_ADDED:

                return this.add(
                    event
                );


            // =========================
            // STOCK UPDATED
            // =========================

            case InventoryEventType.INVENTORY_UPDATED:

                return this.update(
                    state,
                    event
                );


            // =========================
            // STOCK RECEIVED
            // =========================

            case InventoryEventType.INVENTORY_RECEIVED:

                return this.receive(
                    state,
                    event
                );


            // =========================
            // STOCK ADJUSTED
            // =========================

            case InventoryEventType.INVENTORY_ADJUSTED:

                return this.adjust(
                    state,
                    event
                );


            // =========================
            // STOCK TRANSFERRED
            // =========================

            case InventoryEventType.INVENTORY_TRANSFER:

                return this.transfer(
                    state,
                    event
                );


            // =========================
            // SALE
            // =========================

            case salesEventType.SALE_ADDED:

                return this.sell(
                    state,
                    event
                );


            default:

                return state!;

        }

    }


    // =====================================================
    // CREATE
    // =====================================================

    private created(
        event: DomainEvent
    ): Inventory {

        const payload =
            event.payload as InventoryPayload;

        return {

            id:
                event.aggregateId,

            productId:
                payload.productId,

            businessId:
                event.businessId!,

            branchId:
                event.branchId!,

            quantity:
                payload.quantity,

            costPrice:
                payload.costPrice,

            createdAt:
                event.createdAt,

            updatedAt:
                event.createdAt

        };

    }


    // =====================================================
    // ADD STOCK
    // =====================================================

    private add(
        event: DomainEvent
    ): Inventory {

        

        const payload =
            event.payload as InventoryPayload;

        return {
            id: payload.id,
            productId: payload.productId,
            branchId: event.branchId!,
            businessId: event.businessId!,
            quantity: payload.quantity,
            costPrice: payload.costPrice,
            createdAt: event.createdAt

        };

    }


    // =====================================================
    // UPDATE STOCK
    // =====================================================

    private update(
        current: Inventory | null,
        event: DomainEvent
    ): Inventory {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as InventoryPayload;

        return {

            ...state,

            quantity:
                state.quantity +
                payload.quantity,

            updatedAt:
                event.createdAt

        };

    }


    // =====================================================
    // RECEIVE STOCK
    // =====================================================

    private receive(
        current: Inventory | null,
        event: DomainEvent
    ): Inventory {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as InventoryPayload;

        return {

            ...state,

            quantity:
                state.quantity +
                payload.quantity,

            costPrice:
                payload.costPrice,

            updatedAt:
                event.createdAt

        };

    }


    // =====================================================
    // ADJUST STOCK
    // =====================================================

    private adjust(
        current: Inventory | null,
        event: DomainEvent
    ): Inventory {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as InventoryPayload;

        const quantity =
            payload.direction === "increase"

                ? state.quantity +
                  payload.quantity

                : state.quantity -
                  payload.quantity;

        return {

            ...state,

            quantity,

            updatedAt:
                event.createdAt

        };

    }


    // =====================================================
    // TRANSFER STOCK
    // =====================================================

    private transfer(
        current: Inventory | null,
        event: DomainEvent
    ): Inventory {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as InventoryPayload;

        return {

            ...state,

            quantity:
                state.quantity -
                payload.quantity,

            updatedAt:
                event.createdAt

        };

    }


    // =====================================================
    // SALE
    // =====================================================

    private sell(
        current: Inventory | null,
        event: DomainEvent
    ): Inventory {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as InventoryPayload;

        return {

            ...state,

            quantity:
                state.quantity -
                payload.quantity,

            updatedAt:
                event.createdAt

        };

    }


    // =====================================================
    // STATE GUARD
    // =====================================================

    private requireState(
        state: Inventory | null,
        event: DomainEvent
    ): Inventory {

        if (!state) {

            throw new Error(

                `Inventory projection not found for aggregate ${event.aggregateId}. ` +
                `Cannot apply event ${event.type}.`

            );

        }

        return state;

    }

}