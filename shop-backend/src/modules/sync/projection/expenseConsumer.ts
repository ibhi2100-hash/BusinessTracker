// ============================================================
// ExpenseConsumer.ts
// ============================================================

import {
    EventConsumer,
} from "@business/event-bus";

import {
    DomainEvent,
    expenseEventType,
} from "@business/shared-types";

import {
    ExpenseReducer,
} from "@business/projection-families";

import {
    ExpenseRepository,
} from "../repositories/expenseRepository.js";


export class ExpenseConsumer
    implements EventConsumer<DomainEvent> {


    readonly name =
        "expenses";


    constructor(
        private readonly repository: ExpenseRepository
    ) {}


    async handle(
        events: readonly DomainEvent<any>[]
    ): Promise<void> {

        for (
            const event of events
        ) {

            switch (event.type) {


                /*
                 * ==================================================
                 * EXPENSE ADDED
                 * ==================================================
                 */

                case expenseEventType.EXPENSE_RECORDED: {

                    const expense =
                        new ExpenseReducer()
                            .reduce(
                                null,
                                event
                            );


                    await this.repository.upsert(
                        expense
                    );


                    break;
                }


                /*
                 * ==================================================
                 * EXPENSE VOIDED
                 * ==================================================
                 */

                case expenseEventType.EXPENSE_VOIDED: {

                    const existing =
                        await this.repository.findById(

                            event.aggregateId ??
                            event.payload?.expenseId

                        );


                    if (!existing) {
                        break;
                    }


                    const voided =
                        new ExpenseReducer()
                            .reduce(
                                existing,
                                event
                            );


                    await this.repository.upsert(
                        voided
                    );


                    break;
                }


                /*
                 * ==================================================
                 * EXPENSE REIMBURSED
                 * ==================================================
                 */

                case expenseEventType.EXPENSE_REIMBURSED: {

                    const existing =
                        await this.repository.findById(

                            event.aggregateId ??
                            event.payload?.expenseId

                        );


                    if (!existing) {
                        break;
                    }


                    const reimbursed =
                        new ExpenseReducer()
                            .reduce(
                                existing,
                                event
                            );


                    await this.repository.upsert(
                        reimbursed
                    );


                    break;
                }


                /*
                 * ==================================================
                 * UNKNOWN EVENT
                 * ==================================================
                 */

                default:
                    break;

            }

        }

    }

}