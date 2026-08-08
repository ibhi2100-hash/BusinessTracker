import { EventConsumer } from "@business/event-bus";
import { DomainEvent, salesEventType } from "@business/shared-types";
import {  SalesReducer } from "@business/projection-families";
import { SQLiteSalesRepository } from "../repositories/SQLiteProjectionRepository/SQLiteSalesRepository";

export class SalesConsumer
implements EventConsumer<DomainEvent> {
    constructor(
        private readonly repostory: SQLiteSalesRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case salesEventType.SALE_ADDED:
                    const sales = new SalesReducer().reduce(null, event);
                    await this.repostory.upsert(sales)
                    break
            }

        }
    }
}