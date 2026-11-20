import { RepositoryRegistry } from "../sync/repositories/RepositoryRegistry.js";
import { PlatformAnalyticsService } from "./analytics/services/platform-analytics.service.js";
import { PlatformAuditService } from "./audit/service/platform-audit.service.js";
import { PlatformAccessTokenIssuer, PlatformIdentityService } from "./identity/services/platform-indentity.service.js";
import { PlatformRepositoryRegistry } from "./platformRepositoryRegistry.js";
import { PlatformTenantService } from "./tenants/service/platform-tenant.service.js";

export class PlatformServiceRegistry {
    readonly identityService: PlatformIdentityService;
    readonly auditService: PlatformAuditService;
    readonly tenantService: PlatformTenantService;
    readonly analyticService: PlatformAnalyticsService;
    constructor(
        private readonly repositories: PlatformRepositoryRegistry,
        private readonly accessTokenIssuer: PlatformAccessTokenIssuer

    ){
        this.auditService =
             new PlatformAuditService(
                repositories.audits
             )
        this.identityService = 
            new PlatformIdentityService(
                this.auditService,
                this.accessTokenIssuer,
                this.repositories.platformUser,
                this.repositories.platformRole,
                this.repositories.platformPermission,
                this.repositories.platformUserRole,
                this.repositories.platformRolePermission,
                this.repositories.platformSession,
                this.repositories.platformInvitation
            )

        this.tenantService = 
            new PlatformTenantService(
                this.repositories.tenants,
                this.auditService
            )

        this.analyticService = 
            new PlatformAnalyticsService(
                repositories.analytics,
                repositories.tenantsProjection,
                repositories.analyticsRevenue
            )
    }
}