// expenseStatements.ts
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { expenseKeys } from "./expenseStatementKey";

export class ExpenseStatement {
  constructor(private readonly manager: PreparedStatementManager) {}

  get upsert() {
    return this.manager.get(expenseKeys.expenseUpsert);
  }
  get findById() {
    return this.manager.get(expenseKeys.findById);
  }
  get delete() {
    return this.manager.get(expenseKeys.expenseDelete);
  }
  get update() {
    return this.manager.get(expenseKeys.expenseUpdate);
  }
  get findAll() {
    return this.manager.get(expenseKeys.findAll);
  }
  get findByBranch() {
    return this.manager.get(expenseKeys.findByBranch);
  }
  get findByCategory() {
    return this.manager.get(expenseKeys.findByCategory);
  }
  get findByGroup() {
    return this.manager.get(expenseKeys.findByGroup);
  }
  get listExpenses() {
    return this.manager.get(expenseKeys.listExpenses);
  }
  get countExpenses() {
    return this.manager.get(expenseKeys.countExpenses);
  }
  get summaryByDateRange() {
    return this.manager.get(expenseKeys.summaryByDateRange);
  }
  get summaryByCategory() {
    return this.manager.get(expenseKeys.summaryByCategory);
  }
  get allExpenses() {
    return this.manager.get(expenseKeys.getAllExpenses);
  }
}