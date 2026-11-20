
import { Router, type RequestHandler } from "express";

import {
    PlatformIdentityController,
} from "../../modules/platform/identity/controller/platform-identity.controller.js";

import {
    PlatformIdentityService,
} from "../../modules/platform/identity/services/platform-indentity.service.js";

import {
    requirePlatformPermission,
} from "../../middlwares/platform/platform-permission.middleware.js";

export function createPlatformIdentityRoutes(
    controller: PlatformIdentityController,
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
    // PUBLIC AUTHENTICATION ENDPOINTS
    // ------------------------------------------

    router.post(
        "/login",
        controller.login.bind(controller)
    );

    router.post(
        "/refresh",
        controller.refresh.bind(controller)
    );

    router.post(
        "/logout",
        controller.logout.bind(controller)
    );

    router.post(
        "/invitations/accept",
        controller.acceptInvitation.bind(controller)
    );

    // ------------------------------------------
    // AUTHENTICATED PLATFORM IDENTITY
    // ------------------------------------------

    router.use(authenticatePlatform);

    router.get(
        "/me",
        controller.me.bind(controller)
    );

    router.get(
        "/me/permissions",
        controller.myPermissions.bind(controller)
    );

    // ------------------------------------------
    // PLATFORM USERS
    // ------------------------------------------

    router.post(
        "/users/invitations",
        permit("platform.users.invite"),
        controller.inviteUser.bind(controller)
    );

    router.get(
        "/users",
        permit("platform.users.read"),
        controller.listUsers.bind(controller)
    );

    router.patch(
        "/users/:userId/status",
        permit("platform.users.manage"),
        controller.updateUserStatus.bind(controller)
    );

    router.post(
        "/users/:userId/revoke-sessions",
        permit("platform.users.sessions.revoke"),
        controller.revokeUserSessions.bind(controller)
    );

    // ------------------------------------------
    // PLATFORM ROLES
    // ------------------------------------------

    router.post(
        "/roles",
        permit("platform.roles.manage"),
        controller.createRole.bind(controller)
    );

    router.get(
        "/roles",
        permit("platform.roles.read"),
        controller.listRoles.bind(controller)
    );

    router.get(
        "/roles/:roleId",
        permit("platform.roles.read"),
        controller.getRole.bind(controller)
    );

    router.patch(
        "/roles/:roleId",
        permit("platform.roles.manage"),
        controller.updateRole.bind(controller)
    );

    router.delete(
        "/roles/:roleId",
        permit("platform.roles.manage"),
        controller.deleteRole.bind(controller)
    );

    // ------------------------------------------
    // PLATFORM PERMISSIONS
    // ------------------------------------------

    router.post(
        "/permissions",
        permit("platform.permissions.manage"),
        controller.createPermission.bind(controller)
    );

    router.get(
        "/permissions",
        permit("platform.permissions.read"),
        controller.listPermissions.bind(controller)
    );

    // ------------------------------------------
    // ROLE-PERMISSION ASSIGNMENTS
    // ------------------------------------------

    router.put(
        "/roles/:roleId/permissions",
        permit("platform.roles.permissions.manage"),
        controller.replaceRolePermissions.bind(controller)
    );

    router.post(
        "/roles/:roleId/permissions",
        permit("platform.roles.permissions.manage"),
        controller.grantPermission.bind(controller)
    );

    router.delete(
        "/roles/:roleId/permissions/:permissionId",
        permit("platform.roles.permissions.manage"),
        controller.revokePermission.bind(controller)
    );

    // ------------------------------------------
    // USER-ROLE ASSIGNMENTS
    // ------------------------------------------

    router.post(
        "/users/:userId/roles",
        permit("platform.roles.assign"),
        controller.assignRole.bind(controller)
    );

    router.get(
        "/users/:userId/roles",
        permit("platform.users.read"),
        controller.getUserRoles.bind(controller)
    );

    router.delete(
        "/users/:userId/roles/:roleId",
        permit("platform.roles.assign"),
        controller.revokeRole.bind(controller)
    );

    return router;
}
