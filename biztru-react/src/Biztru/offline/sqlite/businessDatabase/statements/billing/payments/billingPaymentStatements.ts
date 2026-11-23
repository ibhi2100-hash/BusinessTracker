import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingPaymentKeys } from "./billingPaymentStatementKey";

export class BillingPaymentStatement {
  private readonly manager: PreparedStatementManager
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingPaymentKeys.upsert); }

  get delete() { return this.manager.get(billingPaymentKeys.delete); }

  get count() { return this.manager.get(billingPaymentKeys.count); }

  get findById() { return this.manager.get(billingPaymentKeys.findById); }

  get findByBusiness() { return this.manager.get(billingPaymentKeys.findByBusiness); }

  get findByInvoice() { return this.manager.get(billingPaymentKeys.findByInvoice); }

  get findBySubscription() { return this.manager.get(billingPaymentKeys.findBySubscription); }

  get findByProviderReference() { return this.manager.get(billingPaymentKeys.findByProviderReference); }

  get findByStatus() { return this.manager.get(billingPaymentKeys.findByStatus); }

  get findAll() { return this.manager.get(billingPaymentKeys.findAll); }
}
