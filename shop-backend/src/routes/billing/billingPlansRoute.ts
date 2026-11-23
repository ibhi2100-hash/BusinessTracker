
import { Router, type RequestHandler } from "express";

import { BillingPlanController } from
  "../../modules/billing/controllers/billing-plan.controller.js";

import { PlatformIdentityService } from
  "../../modules/platform/identity/services/platform-indentity.service.js";

import { requirePlatformPermission } from
  "../../middlwares/platform/platform-permission.middleware.js";

export function createBillingPlansRoutes(
  controller: BillingPlanController,
  identityService: PlatformIdentityService,
  authenticatePlatform: RequestHandler
): Router {
  const router = Router();

  /**
   * Platform permission middleware.
   */
  const permit = (permission: string): RequestHandler =>
    requirePlatformPermission(identityService, permission);

  const readPlans = permit("platform.billing.plans.read");
  const createPlans = permit("platform.billing.plans.create");
  const updatePlans = permit("platform.billing.plans.update");

  // =====================================================
  // PUBLIC BILLING PLAN CATALOGUE
  // =====================================================

  // GET /platform/billing/public/plans
  // No platform authentication required.
  router.get(
    "/public/plans",
    controller.listPublic.bind(controller)
  );

  // =====================================================
  // ADMIN BILLING PLAN MANAGEMENT
  // =====================================================

  // GET /platform/billing/plans
  // List plans with pagination, search and status filters.
  router.get(
    "/plans",
    authenticatePlatform,
    readPlans,
    controller.listAdmin.bind(controller)
  );

  // GET /platform/billing/plans/:planId
  // Retrieve one plan and its version history.
  router.get(
    "/plans/:planId",
    authenticatePlatform,
    readPlans,
    controller.get.bind(controller)
  );

  // POST /platform/billing/plans
  // Create a plan with its initial version.
  router.post(
    "/plans",
    authenticatePlatform,
    createPlans,
    controller.create.bind(controller)
  );

  // Backwards-compatible create endpoint.
  // POST /platform/billing/plans/create
  router.post(
    "/plans/create",
    authenticatePlatform,
    createPlans,
    controller.create.bind(controller)
  );

  // PATCH /platform/billing/plans/:planId
  // Update stable plan metadata.
  router.patch(
    "/plans/:planId",
    authenticatePlatform,
    updatePlans,
    controller.update.bind(controller)
  );

  // POST /platform/billing/plans/:planId/publish
  // Publish a draft billing plan.
  router.post(
    "/plans/:planId/publish",
    authenticatePlatform,
    updatePlans,
    controller.publish.bind(controller)
  );

  // POST /platform/billing/plans/:planId/retire
  // Retire a published billing plan.
  router.post(
    "/plans/:planId/retire",
    authenticatePlatform,
    updatePlans,
    controller.retire.bind(controller)
  );

  return router;
}
