import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { billingEntitlementOverrideKeys } from "./billingEntitlementOverrideStatementKey";

export class BillingEntitlementOverrideStatement {
  private readonly manager: PreparedStatementManager;
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get upsert() { return this.manager.get(billingEntitlementOverrideKeys.upsert); }

  get delete() { return this.manager.get(billingEntitlementOverrideKeys.delete); }

  get count() { return this.manager.get(billingEntitlementOverrideKeys.count); }

  get findById() { return this.manager.get(billingEntitlementOverrideKeys.findById); }

  get findByBusiness() { return this.manager.get(billingEntitlementOverrideKeys.findByBusiness); }

  get findByBusinessAndKey() { return this.manager.get(billingEntitlementOverrideKeys.findByBusinessAndKey); }

  get findActiveByBusiness() { return this.manager.get(billingEntitlementOverrideKeys.findActiveByBusiness); }

  get findBySubscription() { return this.manager.get(billingEntitlementOverrideKeys.findBySubscription); }

  get findAll() { return this.manager.get(billingEntitlementOverrideKeys.findAll); }
}
