import type { ProjectionConsumer } from "@business/event-bus";
import type { DomainEvent, RefundCompletedPayload } from "@business/shared-types";
import { RefundReducer } from "@business/projection-families";
import { SQLiteRefundRepository } from "../repositories/SQLiteProjectionRepository/SQLiteRefundRepository"; 
import { changeNotifier } from "./changeNoifier"; 
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export class RefundConsumer implements ProjectionConsumer<DomainEvent> {
  readonly name = "refunds";
  private readonly states = new Map<string, ReturnType<RefundReducer["reduce"]>>();
  private readonly reducer = new RefundReducer();

  private readonly repository: SQLiteRefundRepository

  constructor(repository: SQLiteRefundRepository) {
    this.repository = repository
  }

  async handle(events: readonly DomainEvent<RefundCompletedPayload>[]): Promise<void> {
    for (const event of events) {
      if (event.type !== "REFUND_COMPLETED") continue;
      const refund = this.reducer.reduce(null, event);
      await this.repository.upsert(refund);
      changeNotifier.notify(["refunds", "sales", "finance", "inventory"]);
    }
  }

  buildOperations(events: readonly DomainEvent<RefundCompletedPayload>[]): SQLiteStatementOperation[] {
    const operations: SQLiteStatementOperation[] = [];

    for (const event of events) {
      if (event.type !== "REFUND_COMPLETED") continue;
      const refund = this.reducer.reduce(null, event);
      this.states.set(refund.id, refund);

      operations.push(this.repository.refundOperation(refund));
      for (const item of refund.items) operations.push(this.repository.itemOperation(item));
      for (const payment of refund.payments) operations.push(this.repository.paymentOperation(payment));
    }

    return operations;
  }
}
