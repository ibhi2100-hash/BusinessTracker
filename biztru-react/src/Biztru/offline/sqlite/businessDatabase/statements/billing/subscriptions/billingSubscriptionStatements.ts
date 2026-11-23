import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingSubscriptionKeys } from "./billingSubscriptionStatementKey";

export class BillingSubscriptionStatement {
  private readonly manager: PreparedStatementManager;
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingSubscriptionKeys.upsert); }

  get delete() { return this.manager.get(billingSubscriptionKeys.delete); }

  get count() { return this.manager.get(billingSubscriptionKeys.count); }

  get findById() { return this.manager.get(billingSubscriptionKeys.findById); }

  get findCurrentByBusiness() { return this.manager.get(billingSubscriptionKeys.findCurrentByBusiness); }

  get findHistoryByBusiness() { return this.manager.get(billingSubscriptionKeys.findHistoryByBusiness); }

  get findByBusinessAndStatus() { return this.manager.get(billingSubscriptionKeys.findByBusinessAndStatus); }

  get findByPlanVersion() { return this.manager.get(billingSubscriptionKeys.findByPlanVersion); }

  get findExpiring() { return this.manager.get(billingSubscriptionKeys.findExpiring); }

  get findAll() { return this.manager.get(billingSubscriptionKeys.findAll); }
}
