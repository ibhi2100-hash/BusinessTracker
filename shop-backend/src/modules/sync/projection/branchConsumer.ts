import { EventConsumer } from "@business/event-bus";
import {  BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { BranchReducer } from "@business/projection-families";
import { BranchRepository } from "../repositories/BranchRepository.js";

export class BranchConsumer
implements EventConsumer<DomainEvent> {
    readonly name = "branches"
    constructor(
        private readonly repostory: BranchRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case BusinessEventTypes.BRANCH_CREATED:
                    const branch = new BranchReducer().reduce(null, event)
                    await this.repostory.upsert(branch!)
                    break
            }

        }
    }
}