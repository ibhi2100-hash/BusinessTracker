import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingSubscriptionRequestKeys } from "./billingSubscriptionRequestStatementKey";

export class BillingSubscriptionRequestStatement {
  private readonly manager: PreparedStatementManager;
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingSubscriptionRequestKeys.upsert); }

  get delete() { return this.manager.get(billingSubscriptionRequestKeys.delete); }

  get count() { return this.manager.get(billingSubscriptionRequestKeys.count); }

  get findById() { return this.manager.get(billingSubscriptionRequestKeys.findById); }

  get findByBusiness() { return this.manager.get(billingSubscriptionRequestKeys.findByBusiness); }

  get findPendingByBusiness() { return this.manager.get(billingSubscriptionRequestKeys.findPendingByBusiness); }

  get findByBusinessAndStatus() { return this.manager.get(billingSubscriptionRequestKeys.findByBusinessAndStatus); }

  get findByPlan() { return this.manager.get(billingSubscriptionRequestKeys.findByPlan); }

  get findAll() { return this.manager.get(billingSubscriptionRequestKeys.findAll); }
}
