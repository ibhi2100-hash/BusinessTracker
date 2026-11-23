
import type {
  PreparedStatementManager,
} from "../../../../PreparedStatement/PreparedStatementManager";

import {
  billingPlanVersionKeys,
} from "./billingPlanVersionStatementKey";

export class BillingPlanVersionStatement {
  private readonly manager: PreparedStatementManager;

  constructor(manager: PreparedStatementManager) {
    this.manager = manager;
  }

  get insert() {
    return this.manager.get(billingPlanVersionKeys.insert);
  }

  get markPublished() {
    return this.manager.get(billingPlanVersionKeys.markPublished);
  }

  get findById() {
    return this.manager.get(billingPlanVersionKeys.findById);
  }

  get findByPlanAndVersion() {
    return this.manager.get(billingPlanVersionKeys.findByPlanAndVersion);
  }

  get findLatest() {
    return this.manager.get(billingPlanVersionKeys.findLatest);
  }

  get findLatestPublished() {
    return this.manager.get(billingPlanVersionKeys.findLatestPublished);
  }

  get findByPlan() {
    return this.manager.get(billingPlanVersionKeys.findByPlan);
  }

  get findPublishedByPlan() {
    return this.manager.get(billingPlanVersionKeys.findPublishedByPlan);
  }

  get findAll() {
    return this.manager.get(billingPlanVersionKeys.findAll);
  }

  get countByPlan() {
    return this.manager.get(billingPlanVersionKeys.countByPlan);
  }

  get getAll() {
    return this.manager.get(billingPlanVersionKeys.getAll);
  }
}
