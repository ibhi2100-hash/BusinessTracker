import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingEntitlementKeys } from "./billingEntitlementStatementKey";

export class BillingEntitlementStatement {
  private readonly manager: PreparedStatementManager
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingEntitlementKeys.upsert); }

  get delete() { return this.manager.get(billingEntitlementKeys.delete); }

  get count() { return this.manager.get(billingEntitlementKeys.count); }

  get findById() { return this.manager.get(billingEntitlementKeys.findById); }

  get findByBusinessAndKey() { return this.manager.get(billingEntitlementKeys.findByBusinessAndKey); }

  get findByBusiness() { return this.manager.get(billingEntitlementKeys.findByBusiness); }

  get findActiveByBusiness() { return this.manager.get(billingEntitlementKeys.findActiveByBusiness); }

  get findBySubscription() { return this.manager.get(billingEntitlementKeys.findBySubscription); }

  get findAll() { return this.manager.get(billingEntitlementKeys.findAll); }
}
