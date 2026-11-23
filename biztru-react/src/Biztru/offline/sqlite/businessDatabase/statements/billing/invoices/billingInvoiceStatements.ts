import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingInvoiceKeys } from "./billingInvoiceStatementKey";

export class BillingInvoiceStatement {
  private readonly manager: PreparedStatementManager;
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingInvoiceKeys.upsert); }

  get delete() { return this.manager.get(billingInvoiceKeys.delete); }

  get count() { return this.manager.get(billingInvoiceKeys.count); }

  get findById() { return this.manager.get(billingInvoiceKeys.findById); }

  get findByBusiness() { return this.manager.get(billingInvoiceKeys.findByBusiness); }

  get findBySubscription() { return this.manager.get(billingInvoiceKeys.findBySubscription); }

  get findByNumber() { return this.manager.get(billingInvoiceKeys.findByNumber); }

  get findByStatus() { return this.manager.get(billingInvoiceKeys.findByStatus); }

  get findOverdue() { return this.manager.get(billingInvoiceKeys.findOverdue); }

  get findAll() { return this.manager.get(billingInvoiceKeys.findAll); }
}
