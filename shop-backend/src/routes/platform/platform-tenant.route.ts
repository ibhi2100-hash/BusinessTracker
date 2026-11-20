
import { Router, type RequestHandler } from "express";

import {
    PlatformTenantController,
} from "../../modules/platform/tenants/controller/platform-tenant.controller.js";

import {
    PlatformIdentityService,
} from "../../modules/platform/identity/services/platform-indentity.service.js";

import {
    requirePlatformPermission,
} from "../../middlwares/platform/platform-permission.middleware.js";

export function createPlatformTenantRoutes(
    controller: PlatformTenantController,
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
    // TENANT DISCOVERY
    // ------------------------------------------

    router.get(
        "/",
        permit("platform.tenants.read"),
        controller.list.bind(controller)
    );

    router.get(
        "/:businessId",
        permit("platform.tenants.read"),
        controller.getById.bind(controller)
    );

    // ------------------------------------------
    // TENANT RESOURCES
    // ------------------------------------------

    router.get(
        "/:businessId/branches",
        permit("platform.tenants.branches.read"),
        controller.branches.bind(controller)
    );

    router.get(
        "/:businessId/employees",
        permit("platform.tenants.employees.read"),
        controller.employees.bind(controller)
    );

    router.get(
        "/:businessId/operations",
        permit("platform.tenants.operations.read"),
        controller.operationalOverview.bind(controller)
    );

    // ------------------------------------------
    // TENANT LIFECYCLE MANAGEMENT
    // ------------------------------------------

    router.post(
        "/:businessId/suspend",
        permit("platform.tenants.suspend"),
        controller.suspend.bind(controller)
    );

    router.post(
        "/:businessId/reactivate",
        permit("platform.tenants.reactivate"),
        controller.reactivate.bind(controller)
    );

    return router;
}
