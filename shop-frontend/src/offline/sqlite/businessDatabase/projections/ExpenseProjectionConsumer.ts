// ExpenseConsumer.ts
import { EventConsumer } from "@business/event-bus";
import { DomainEvent, expenseEventType } from "@business/shared-types";
import { ExpenseReducer } from "@business/projection-families";
import { SQLiteExpenseRepository } from "../repositories/SQLiteProjectionRepository/SQLiteExpenseRepository";
import { changeNotifier } from "./changeNoifier";

export class ExpenseConsumer implements EventConsumer<DomainEvent> {
  readonly name = "expenses";

  constructor(private readonly repository: SQLiteExpenseRepository) {}

  async handle(events: readonly DomainEvent<any>[]): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case expenseEventType.EXPENSE_RECORDED: {
          const expense = new ExpenseReducer().reduce(null, event);
          await this.repository.upsert(expense);
          changeNotifier.notify(["expenses"]);
          break;
        }

        case expenseEventType.EXPENSE_VOIDED: {
          const existing = await this.repository.findById(
            event.aggregateId ?? event.payload?.expenseId
          );
          if (!existing) break;

          const voided = new ExpenseReducer().reduce(existing, event);
          await this.repository.upsert(voided);
          changeNotifier.notify(["expenses"]);
          break;
        }

        case expenseEventType.EXPENSE_REIMBURSED: {
          const existing = await this.repository.findById(
            event.aggregateId ?? event.payload?.expenseId
          );
          if (!existing) break;

          const reimbursed = new ExpenseReducer().reduce(existing, event);
          await this.repository.upsert(reimbursed);
          changeNotifier.notify(["expenses"]);
          break;
        }

        default:
          break;
      }
    }
  }
}