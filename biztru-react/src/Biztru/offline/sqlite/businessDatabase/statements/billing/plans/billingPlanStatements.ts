
import type {
  PreparedStatementManager,
} from "../../../../PreparedStatement/PreparedStatementManager";

import {
  billingPlanKeys,
} from "./billingPlanStatementKey";

export class BillingPlanStatement {
  private readonly manager: PreparedStatementManager;

  constructor(manager: PreparedStatementManager) {
    this.manager = manager;
  }

  get upsert() {
    return this.manager.get(billingPlanKeys.upsert);
  }

  get findById() {
    return this.manager.get(billingPlanKeys.findById);
  }

  get findByCode() {
    return this.manager.get(billingPlanKeys.findByCode);
  }

  get update() {
    return this.manager.get(billingPlanKeys.update);
  }

  get delete() {
    return this.manager.get(billingPlanKeys.delete);
  }

  get findAll() {
    return this.manager.get(billingPlanKeys.findAll);
  }

  get list() {
    return this.manager.get(billingPlanKeys.list);
  }

  get count() {
    return this.manager.get(billingPlanKeys.count);
  }

  get findPublished() {
    return this.manager.get(billingPlanKeys.findPublished);
  }

  get getAll() {
    return this.manager.get(billingPlanKeys.getAll);
  }
}
