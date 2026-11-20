
import { Router, type RequestHandler } from "express";

import {
    PlatformAnalyticsController,
} from "../../modules/platform/analytics/controller/platform-analytics.controller.js";

import {
    PlatformIdentityService,
} from "../../modules/platform/identity/services/platform-indentity.service.js";

import {
    requirePlatformPermission,
} from "../../middlwares/platform/platform-permission.middleware.js";

export function createPlatformAnalyticsRoutes(
    controller: PlatformAnalyticsController,
    identityService: PlatformIdentityService,
    authenticatePlatform: RequestHandler
): Router {

    const router = Router();

    const permit = (permission: string): RequestHandler =>
        requirePlatformPermission(
            identityService,
            permission
        );

    // ------------------------------------------
    // AUTHENTICATION
    // ------------------------------------------

    router.use(authenticatePlatform);

    // ------------------------------------------
    // PLATFORM DASHBOARD
    // ------------------------------------------

    router.get(
        "/dashboard",
        permit("platform.analytics.read"),
        controller.dashboard.bind(controller)
    );

    // ------------------------------------------
    // REVENUE ANALYTICS
    // ------------------------------------------

    router.get(
        "/revenue",
        permit("platform.analytics.revenue.read"),
        controller.revenueTrend.bind(controller)
    );

    // ------------------------------------------
    // METRIC ANALYTICS
    // ------------------------------------------

    router.get(
        "/metrics/:metricKey",
        permit("platform.analytics.read"),
        controller.metricTrend.bind(controller)
    );

    // ------------------------------------------
    // TENANT GROWTH
    // ------------------------------------------

    router.get(
        "/tenant-growth",
        permit("platform.analytics.read"),
        controller.tenantGrowth.bind(controller)
    );

    // ------------------------------------------
    // PROJECTION HEALTH
    // ------------------------------------------

    router.get(
        "/projection-health",
        permit("platform.analytics.projections.read"),
        controller.projectionHealth.bind(controller)
    );

    return router;
}
