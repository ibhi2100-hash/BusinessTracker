
import { Router, type RequestHandler } from "express";

import { BillingPlanController } from
  "../../modules/billing/controllers/billing-plan.controller.js";

import { PlatformIdentityService } from
  "../../modules/platform/identity/services/platform-indentity.service.js";

import { requirePlatformPermission } from
  "../../middlwares/platform/platform-permission.middleware.js";

/* -------------------------------------------------------------------------- */
/* PLATFORM BILLING ROUTES                                                    */
/* Mount: /platform/billing                                                   */
/* -------------------------------------------------------------------------- */

export function createBillingPlansRoutes(
  controller: BillingPlanController,
  identityService: PlatformIdentityService,
  authenticatePlatform: RequestHandler
): Router {
  const router = Router();

  const permit = (permission: string): RequestHandler =>
    requirePlatformPermission(identityService, permission);

  const readPlans = permit("platform.billing.plans.read");
  const createPlans = permit("platform.billing.plans.create");
  const updatePlans = permit("platform.billing.plans.update");

  // Public catalogue (no platform authentication required).
  router.get(
    "/public/plans",
    controller.listPublic.bind(controller)
  );

  // Admin plan management.
  router.get(
    "/plans",
    authenticatePlatform,
    readPlans,
    controller.listAdmin.bind(controller)
  );

  router.get(
    "/plans/:planId",
    authenticatePlatform,
    readPlans,
    controller.get.bind(controller)
  );

  router.get(
    "/plans/:planId/versions",
    authenticatePlatform,
    readPlans,
    controller.listVersions.bind(controller)
  );

  router.get(
    "/plans/:planId/versions/:planVersion",
    authenticatePlatform,
    readPlans,
    controller.getVersion.bind(controller)
  );

  // Create plan.
  router.post(
    "/plans",
    authenticatePlatform,
    createPlans,
    controller.create.bind(controller)
  );

  // Backwards-compatible creation endpoint.
  router.post(
    "/plans/create",
    authenticatePlatform,
    createPlans,
    controller.create.bind(controller)
  );

  // Update stable plan metadata.
  router.patch(
    "/plans/:planId",
    authenticatePlatform,
    updatePlans,
    controller.update.bind(controller)
  );

  // Publish latest unpublished version.
  router.post(
    "/plans/:planId/publish",
    authenticatePlatform,
    updatePlans,
    controller.publish.bind(controller)
  );

  // Retire plan.
  router.post(
    "/plans/:planId/retire",
    authenticatePlatform,
    updatePlans,
    controller.retire.bind(controller)
  );

  return router;
}

/* -------------------------------------------------------------------------- */
/* BUSINESS BILLING PLAN ROUTES                                               */
/* Mount: /business/billing                                                  */
/* Uses business authMiddleware, NOT platform authentication.                */
/* -------------------------------------------------------------------------- */

export function createBusinessBillingPlanRoutes(
  controller: BillingPlanController,
  authenticateBusiness: RequestHandler
): Router {
  const router = Router();

  /**
   * GET /business/billing/plans
   *
   * Retrieve published plans and their latest published versions.
   * Requires a valid business access token.
   */
  router.get(
    "/plans",
    authenticateBusiness,
    controller.listPublic.bind(controller)
  );

  /**
   * GET /business/billing/plans/:planId/versions
   *
   * Retrieve only published versions of a published plan.
   */
  router.get(
    "/plans/:planId/versions",
    authenticateBusiness,
    controller.listPublicVersions.bind(controller)
  );

  /**
   * GET /business/billing/plans/:planId/versions/:planVersion
   *
   * Retrieve one specific published version.
   * Draft versions are never exposed.
   */
  router.get(
    "/plans/:planId/versions/:planVersion",
    authenticateBusiness,
    controller.getPublicVersion.bind(controller)
  );

  return router;
}
