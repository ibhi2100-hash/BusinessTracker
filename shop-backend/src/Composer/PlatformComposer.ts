import { Router } from "express";

import { PlatformIdentityService } from
    "../modules/platform/identity/services/platform-indentity.service.js";

import { PlatformAuditService } from "../modules/platform/audit/service/platform-audit.service.js"; 
// Import your actual token issuer and verifier implementations.
import type { PlatformAccessTokenIssuer } from "../modules/platform/identity/services/platform-indentity.service.js";

import { createPlatformAuthMiddleware } from "../middlwares/platform/platform-auth.middleware.js"

// Import your platform route factories.
import { createPlatformIdentityRoutes } from
    "../routes/platform/platform-identity.route.js";

import { createPlatformAuditRoutes } from
    "../routes/platform/platform-audit.route.js";
import { PlatformRepositoryRegistry } from "../modules/platform/platformRepositoryRegistry.js";
import { PlatformServiceRegistry } from "../modules/platform/platformServiceRegistry.js";
import { PlatformControllerRegistry } from "../modules/platform/platformControllersRegistry.js";
import { createPlatformTenantRoutes } from "../routes/platform/platform-tenant.route.js";
import { PlatformJwtService } from "../modules/platform/identity/services/platform-jwt.service.js";
import { createPlatformAnalyticsRoutes } from "../routes/platform/platform-analytics.routes.js";

// ------------------------------------------
// DEPENDENCIES
// ------------------------------------------

interface PlatformComposerDependencies {
    jwtService: PlatformJwtService;
}

// ------------------------------------------
// ROUTERS
// ------------------------------------------

export interface PlatformRouters {
    identity: Router;
    audit: Router;
    tenant: Router;
    analytics: Router;
}

// ------------------------------------------
// PLATFORM MODULE
// ------------------------------------------

export interface PlatformModule {
    router: PlatformRouters;
    services: PlatformServiceRegistry;
    repositories: PlatformRepositoryRegistry;
    controllers: PlatformControllerRegistry;
}

// ------------------------------------------
// COMPOSER
// ------------------------------------------

export class PlatformComposer {

    constructor(
        private readonly dependencies: PlatformComposerDependencies
    ) {}

    async boot(): Promise<PlatformModule> {

        // ------------------------------------------
        // JWT
        // ------------------------------------------

        const jwtService = this.dependencies.jwtService;

        // ------------------------------------------
        // REPOSITORIES
        // ------------------------------------------

        const repositories =
            new PlatformRepositoryRegistry();

        // ------------------------------------------
        // SERVICES
        // ------------------------------------------

        const services =
            new PlatformServiceRegistry(
                repositories,
                jwtService
            );

        const identityService = services.identityService;

        // ------------------------------------------
        // CONTROLLERS
        // ------------------------------------------

        const controllers =
            new PlatformControllerRegistry(services);

        // ------------------------------------------
        // AUTHENTICATION
        // ------------------------------------------

        const authenticatePlatform =
            createPlatformAuthMiddleware(
                jwtService,
                identityService
            );

        // ------------------------------------------
        // IDENTITY ROUTES
        // ------------------------------------------

        const identityRoutes =
            createPlatformIdentityRoutes(
                controllers.identityController,
                identityService,
                authenticatePlatform
            );

        // ------------------------------------------
        // AUDIT ROUTES
        // ------------------------------------------

        const auditRoutes =
            createPlatformAuditRoutes(
                controllers.auditController,
                identityService,
                authenticatePlatform
            );

        // ------------------------------------------
        // TENANT ROUTES
        // ------------------------------------------

        const tenantRoutes =
            createPlatformTenantRoutes(
                controllers.tenantController,
                identityService,
                authenticatePlatform
            );

        // ------------------------------------------
        // ANALYTICS ROUTES
        // ------------------------------------------

        const analyticsRoutes =
            createPlatformAnalyticsRoutes(
                controllers.analyticsController,
                identityService,
                authenticatePlatform
            );

        // ------------------------------------------
        // RETURN PLATFORM MODULE
        // ------------------------------------------

        return {
            router: {
                identity: identityRoutes,
                audit: auditRoutes,
                tenant: tenantRoutes,
                analytics: analyticsRoutes,
            },

            services,
            repositories,
            controllers,
        };
    }
}