
import { Router, type RequestHandler } from "express";

import { BillingSubscriptionController } from "../../modules/billing/controllers/billing-subscription.controller.js"; 

import { PlatformIdentityService } from
  "../../modules/platform/identity/services/platform-indentity.service.js";

import { requirePlatformPermission } from
  "../../middlwares/platform/platform-permission.middleware.js";

/* -------------------------------------------------------------------------- */
/* PLATFORM BILLING ROUTES                                                    */
/* Mount: /platform/billing                                                   */
/* -------------------------------------------------------------------------- */

export function createBillingSubscriptionRoutes(
  controller: BillingSubscriptionController,
  identityService: PlatformIdentityService,
  authenticatePlatform: RequestHandler
): Router {
  const router = Router();

  const permit = (permission: string): RequestHandler =>
    requirePlatformPermission(identityService, permission);


  // Public catalogue (no platform authentication required).
  router.get(
    "/subscriptions/metrics",
    controller.current.bind(controller)
  );


  return router;
}

/* -------------------------------------------------------------------------- */
/* BUSINESS BILLING PLAN ROUTES                                               */
/* Mount: /business/billing                                                  */
/* Uses business authMiddleware, NOT platform authentication.                */
/* -------------------------------------------------------------------------- */

