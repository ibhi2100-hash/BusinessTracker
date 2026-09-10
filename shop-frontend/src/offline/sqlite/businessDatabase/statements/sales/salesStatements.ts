// ============================================================
// salesStatements.ts
// ============================================================

import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";

import { salesKeys } from "./salesStatementKeys";


export class SalesStatement {

  constructor(
    private readonly manager: PreparedStatementManager
  ) {}

  get upsert() {
    return this.manager.get(salesKeys.salesUpsert);
  }

  get findById() {
    return this.manager.get(salesKeys.findById);
  }

  get delete() {
    return this.manager.get(salesKeys.salesDelete);
  }

  get update() {
    return this.manager.get(salesKeys.salesUpdate);
  }

  get findAll() {
    return this.manager.get(salesKeys.findAll);
  }

  get findByBranch() {
    return this.manager.get(salesKeys.findByBranch);
  }

  get findByProduct() {
    return this.manager.get(salesKeys.findByProduct);
  }

  get findByGroup() {
    return this.manager.get(salesKeys.findByGroup);
  }

  get listSales() {
    return this.manager.get(salesKeys.listSales);
  }

  get countSales() {
    return this.manager.get(salesKeys.countSales);
  }

  get summaryByDateRange() {
    return this.manager.get(salesKeys.summaryByDateRange);
  }

  get allSales() {
    return this.manager.get(salesKeys.getAllSales);
  }

}