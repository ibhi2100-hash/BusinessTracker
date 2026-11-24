
import { Router } from "express";

import { createPlatformAuthMiddleware } from
    "../middlwares/platform/platform-auth.middleware.js";

import { createPlatformIdentityRoutes } from
    "../routes/platform/platform-identity.route.js";

import { createPlatformAuditRoutes } from
    "../routes/platform/platform-audit.route.js";

import { createPlatformTenantRoutes } from
    "../routes/platform/platform-tenant.route.js";

import { createPlatformAnalyticsRoutes } from
    "../routes/platform/platform-analytics.routes.js";

import { createBillingPlansRoutes } from
    "../routes/billing/billingPlansRoute.js";

import { PlatformRepositoryRegistry } from
    "../modules/platform/platformRepositoryRegistry.js";

import { PlatformServiceRegistry } from
    "../modules/platform/platformServiceRegistry.js";

import { PlatformControllerRegistry } from
    "../modules/platform/platformControllersRegistry.js";

import { PlatformJwtService } from
    "../modules/platform/identity/services/platform-jwt.service.js";

import { BillingRepositoryRegistry } from
    "../modules/billing/billingRepositoryRegistry.js";

import { BillingServiceRegistry } from
    "../modules/billing/billingServiceRegistry.js";

import { BillingControllerRegistry } from
    "../modules/billing/billingControllerRegistry.js";
import { createBillingSubscriptionRoutes } from "../routes/billing/billingSubscriptionRoutes.js";

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

    // Commercial / Billing
    plans: Router;
    subscription: Router;
}

// ------------------------------------------
// PLATFORM MODULE
// ------------------------------------------

export interface PlatformModule {
    router: PlatformRouters;
    services: PlatformServiceRegistry;
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
        // PLATFORM REPOSITORIES
        // ------------------------------------------

        const repositories =
            new PlatformRepositoryRegistry();

        // ------------------------------------------
        // PLATFORM SERVICES
        // ------------------------------------------

        const services =
            new PlatformServiceRegistry(
                repositories,
                jwtService
            );

        const identityService =
            services.identityService;

        // ------------------------------------------
        // PLATFORM CONTROLLERS
        // ------------------------------------------

        const controllers =
            new PlatformControllerRegistry(services);

        // ------------------------------------------
        // BILLING REPOSITORIES
        // ------------------------------------------

        const billingRepositories =
            new BillingRepositoryRegistry();

        // ------------------------------------------
        // BILLING SERVICES
        // ------------------------------------------

        const billingServices =
            new BillingServiceRegistry(
                billingRepositories
            );

        // ------------------------------------------
        // BILLING CONTROLLERS
        // ------------------------------------------

        const billingControllers =
            new BillingControllerRegistry(
                billingServices
            );

        // ------------------------------------------
        // SHARED PLATFORM AUTHENTICATION
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
        // BILLING PLANS ROUTES
        // ------------------------------------------

        const plansRoutes =
            createBillingPlansRoutes(
                billingControllers.billingPlanController,
                identityService,
                authenticatePlatform
            );

        const subscriptionRoutes = 
            createBillingSubscriptionRoutes(
                billingControllers.billingSubscriptionController,
                services.identityService,
                authenticatePlatform
            )

        // ------------------------------------------
        // RETURN PLATFORM MODULE
        // ------------------------------------------

        return {
            router: {
                identity: identityRoutes,
                audit: auditRoutes,
                tenant: tenantRoutes,
                analytics: analyticsRoutes,
                plans: plansRoutes,
                subscription: subscriptionRoutes
            },

            services,
        };
    }
}
