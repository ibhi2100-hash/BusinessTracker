
import type { DomainEvent } from "../../../../domain/events/DomainEvent";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export class BillingProjectionConsumer {
    readonly name = "BillingProjectionConsumer";

    constructor(
        private readonly subscriptions: SQLiteBillingSubscriptionRepository,
        private readonly invoices: SQLiteBillingInvoiceRepository,
        private readonly payments: SQLiteBillingPaymentRepository,
    ) {}

    buildOperations(
        events: readonly DomainEvent[],
    ): SQLiteStatementOperation[] {
        const operations: SQLiteStatementOperation[] = [];

        for (const event of events) {
            switch (event.type) {
                // Add event-specific reducers here.
                // Convert each event into its resulting projection entity.
                //
                // Example:
                // case SubscriptionEventType.SUBSCRIPTION_ACTIVATED: {
                //     const subscription = ...;
                //     operations.push(
                //         this.subscriptions.upsertOperation(subscription)
                //     );
                //     break;
                // }
            }
        }

        return operations;
    }
}
