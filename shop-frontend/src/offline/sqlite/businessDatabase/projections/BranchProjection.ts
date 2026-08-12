import { EventConsumer } from "@business/event-bus";
import {  BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { BranchReducer } from "@business/projection-families";
import { SQLiteBranchRepository } from "../repositories/SQLiteProjectionRepository/SQLiteBranchRepository";
import { changeNotifier } from "./changeNoifier";

export class BranchConsumer
implements EventConsumer<DomainEvent> {
    readonly name = "branches"
    constructor(
        private readonly repostory: SQLiteBranchRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case BusinessEventTypes.BRANCH_CREATED:
                    const branch = new BranchReducer().reduce(null, event)
                    await this.repostory.upsert(branch)
                    changeNotifier.notify(["branches"])
                    break
            }

        }
    }
}