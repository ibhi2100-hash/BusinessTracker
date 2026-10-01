import type{ ProjectionConsumer } from "@business/event-bus";
import {
  expenseEventType,
} from "@business/shared-types";
import type { DomainEvent } from "@business/shared-types";
import { ExpenseReducer } from "@business/projection-families";
import { SQLiteExpenseRepository } from "../repositories/SQLiteProjectionRepository/SQLiteExpenseRepository";
import { changeNotifier } from "./changeNoifier";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 

export class ExpenseConsumer
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "expenses";

  /**
   * Rebuild state.
   *
   * This is intentionally kept in memory rather than reading
   * from the expense projection table during rebuild.
   */
  private readonly states = new Map<string, any>();

  constructor(
    private readonly repository: SQLiteExpenseRepository
  ) {}

  async handle(events: readonly DomainEvent<any>[]): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case expenseEventType.EXPENSE_RECORDED: {
          const expense =
            new ExpenseReducer().reduce(null, event);

          await this.repository.upsert(expense);

          changeNotifier.notify(["expenses"]);
          break;
        }

        case expenseEventType.EXPENSE_VOIDED: {
          const expenseId =
            event.aggregateId ??
            event.payload?.expenseId;

          const existing =
            await this.repository.findById(expenseId);

          if (!existing) break;

          const voided =
            new ExpenseReducer().reduce(existing, event);

          await this.repository.upsert(voided);

          changeNotifier.notify(["expenses"]);
          break;
        }

        case expenseEventType.EXPENSE_REIMBURSED: {
          const expenseId =
            event.aggregateId ??
            event.payload?.expenseId;

          const existing =
            await this.repository.findById(expenseId);

          if (!existing) break;

          const reimbursed =
            new ExpenseReducer().reduce(existing, event);

          await this.repository.upsert(reimbursed);

          changeNotifier.notify(["expenses"]);
          break;
        }

        default:
          break;
      }
    }
  }

  buildOperations(
    events: readonly DomainEvent<any>[]
  ): SQLiteStatementOperation[] {
    const operations: SQLiteStatementOperation[] = [];

    for (const event of events) {
      switch (event.type) {
        case expenseEventType.EXPENSE_RECORDED: {
          const expense =
            new ExpenseReducer().reduce(null, event);

          const expenseId = this.getExpenseId(event, expense);

          this.states.set(expenseId, expense);

          operations.push(
            this.repository.upsertOperation(expense)
          );

          break;
        }

        case expenseEventType.EXPENSE_VOIDED: {
          const expenseId =
            event.aggregateId ??
            event.payload?.expenseId;

          const existing =
            this.states.get(expenseId);

          if (!existing) break;

          const voided =
            new ExpenseReducer().reduce(existing, event);

          this.states.set(expenseId, voided);

          operations.push(
            this.repository.upsertOperation(voided)
          );

          break;
        }

        case expenseEventType.EXPENSE_REIMBURSED: {
          const expenseId =
            event.aggregateId ??
            event.payload?.expenseId;

          const existing =
            this.states.get(expenseId);

          if (!existing) break;

          const reimbursed =
            new ExpenseReducer().reduce(existing, event);

          this.states.set(expenseId, reimbursed);

          operations.push(
            this.repository.upsertOperation(reimbursed)
          );

          break;
        }

        default:
          break;
      }
    }

    return operations;
  }

  private getExpenseId(
    event: DomainEvent<any>,
    expense: any
  ): string {
    return (
      event.aggregateId ??
      event.payload?.expenseId ??
      expense.id
    );
  }
}