import { PlatformAnalyticsController } from "./analytics/controller/platform-analytics.controller.js";
import { PlatformAuditController } from "./audit/controller/platform-audit.controller.js";
import { PlatformIdentityController } from "./identity/controller/platform-identity.controller.js";
import { PlatformServiceRegistry } from "./platformServiceRegistry.js";
import { PlatformTenantController } from "./tenants/controller/platform-tenant.controller.js";

export class PlatformControllerRegistry {
    readonly identityController: PlatformIdentityController;
    readonly tenantController: PlatformTenantController;
    readonly auditController: PlatformAuditController;
    readonly analyticsController: PlatformAnalyticsController;
    constructor(
        private readonly services: PlatformServiceRegistry
    ){

        this.identityController = new PlatformIdentityController(services.identityService);
        this.tenantController = new PlatformTenantController(services.tenantService);
        this.auditController = new PlatformAuditController(services.auditService)
        this.analyticsController = new PlatformAnalyticsController(services.analyticService)
    }
}