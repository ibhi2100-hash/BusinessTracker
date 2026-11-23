import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingSubscriptionLeaseKeys } from "./billingSubscriptionLeaseStatementKey";

export class BillingSubscriptionLeaseStatement {
  private readonly manager: PreparedStatementManager
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingSubscriptionLeaseKeys.upsert); }

  get delete() { return this.manager.get(billingSubscriptionLeaseKeys.delete); }

  get count() { return this.manager.get(billingSubscriptionLeaseKeys.count); }

  get findById() { return this.manager.get(billingSubscriptionLeaseKeys.findById); }

  get findByBusiness() { return this.manager.get(billingSubscriptionLeaseKeys.findByBusiness); }

  get findByDevice() { return this.manager.get(billingSubscriptionLeaseKeys.findByDevice); }

  get findActiveByBusiness() { return this.manager.get(billingSubscriptionLeaseKeys.findActiveByBusiness); }

  get findBySubscription() { return this.manager.get(billingSubscriptionLeaseKeys.findBySubscription); }

  get findExpired() { return this.manager.get(billingSubscriptionLeaseKeys.findExpired); }

  get findAll() { return this.manager.get(billingSubscriptionLeaseKeys.findAll); }
}
