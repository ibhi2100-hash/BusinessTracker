import {
    DomainEvent,
    InventoryEventType,
    Product,
    
} from "@business/shared-types";

import { ProjectionReducer } from "../contracts/ProjectionReducer";


interface ProductPayload {

    id: string;

    name: string;

    imageUrl?: string;

    description?: string;

    costPrice: number;

    price: number;

}


export class ProductReducer
implements ProjectionReducer<Product, DomainEvent> {


    reduce(
        state: Product | null,
        event: DomainEvent
    ): Product {

        switch (event.type) {


            // =====================================================
            // CREATE PRODUCT
            // =====================================================

            case InventoryEventType.PRODUCT_CREATED:

                return this.created(
                    event
                );


            // =====================================================
            // UPDATE PRODUCT
            // =====================================================

            case InventoryEventType.PRODUCT_UPDATED:

                return this.update(
                    state,
                    event
                );


            // =====================================================
            // DELETE PRODUCT
            // =====================================================

            case InventoryEventType.PRODUCT_DELETED:

                return this.deleted(
                    state,
                    event
                );


            // =====================================================
            // INVENTORY RECEIVED
            // =====================================================

            case InventoryEventType.INVENTORY_RECEIVED:

                return this.inventoryReceived(
                    state,
                    event
                );


            // =====================================================
            // UNKNOWN EVENT
            // =====================================================

            default:

                return state!;

        }

    }


    // =========================================================
    // CREATE
    // =========================================================

    private created(
        event: DomainEvent
    ): Product {

        const payload =
            event.payload as ProductPayload;

        return {

            id:
                event.aggregateId,

            name:
                payload.name,

            price:
                payload.price,

            costPrice:
                payload.costPrice,

            imageUrl:
                payload.imageUrl,

            description:
                payload.description,

            businessId:
                event.businessId ??
                undefined,

            branchId:
                event.branchId ??
                undefined,

            isActive:
                true,

            isDeleted:
                false,

            createdAt:
                event.createdAt,

            updatedAt:
                event.createdAt

        };

    }


    // =========================================================
    // UPDATE
    // =========================================================

    private update(
        current: Product | null,
        event: DomainEvent
    ): Product {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as ProductPayload;

        return {

            ...state,

            name:
                payload.name,

            price:
                payload.price,

            costPrice:
                payload.costPrice,

            imageUrl:
                payload.imageUrl ??
                state.imageUrl,

            description:
                payload.description ??
                state.description,

            updatedAt:
                event.createdAt

        };

    }


    // =========================================================
    // DELETE
    // =========================================================

    private deleted(
        current: Product | null,
        event: DomainEvent
    ): Product {

        const state =
            this.requireState(
                current,
                event
            );

        return {

            ...state,

            isActive:
                false,

            isDeleted:
                true,

            deletedAt:
                event.createdAt,

            updatedAt:
                event.createdAt

        };

    }


    // =========================================================
    // INVENTORY RECEIVED
    // =========================================================

    private inventoryReceived(
        current: Product | null,
        event: DomainEvent
    ): Product {

        const state =
            this.requireState(
                current,
                event
            );

        const payload =
            event.payload as ProductPayload;

        const newCost =
            payload.costPrice;


        // No projection change required.
        if (
            newCost ===
            state.costPrice
        ) {

            return state;

        }


        return {

            ...state,

            costPrice:
                newCost,

            updatedAt:
                event.createdAt

        };

    }


    // =========================================================
    // STATE GUARD
    // =========================================================

    private requireState(
        state: Product | null,
        event: DomainEvent
    ): Product {

        if (!state) {

            throw new Error(

                `Product projection not found for aggregate ` +
                `${event.aggregateId}. ` +
                `Cannot apply event ${event.type}.`

            );

        }

        return state;

    }

}