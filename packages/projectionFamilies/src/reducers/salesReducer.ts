import {
    DomainEvent,
    Sales,
    salesEventType
} from "@business/shared-types";

import { ProjectionReducer } from "../contracts/ProjectionReducer";


interface SalesPayload {

    id: string;

    productId: string;

    price: number;

    costPrice: number;

    quantity: number;

    total: number;

}


export class SalesReducer
implements ProjectionReducer<Sales, DomainEvent> {


    reduce(
        state: Sales | null,
        event: DomainEvent<SalesPayload>
    ): Sales {

        switch (event.type) {


            // =====================================================
            // CREATE SALE
            // =====================================================

            case salesEventType.SALE_ADDED:

                return this.created(
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
    // CREATE SALE
    // =========================================================

    private created(
        event: DomainEvent<SalesPayload>
    ): Sales {

        const payload =
            event.payload;

        return {

            id:
                event.aggregateId,

            businessId:
                event.businessId,

            branchId:
                event.branchId,

            productId:
                payload.productId,

            quantity:
                payload.quantity,

            price:
                payload.price,

            costPrice:
                payload.costPrice,

            total:
                payload.quantity *
                payload.price,

            userId:
                event.actor.userId,

            createdAt:
                event.createdAt,

            updatedAt:
                event.createdAt

        };

    }

}