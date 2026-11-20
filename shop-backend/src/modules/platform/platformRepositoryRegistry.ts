import { PlatformDailyMetricRepository } from "./analytics/repositories/platform-daily-metric.repository.js";
import { PlatformProjectionEventRepository } from "./analytics/repositories/platform-projection-event.repository.js";
import { PlatformRevenueRepository } from "./analytics/repositories/platform-revenue.repository.js";
import { PlatformTenantProjectionRepository } from "./analytics/repositories/platform-tenant-projection.repository.js";
import { PlatformAnalyticsRepository } from "./analytics/repositories/platform.analytics.repository.js";
import { PlatformAuditRepository } from "./audit/repositories/platform-audit.repository.js";
import { PlatformInvitationRepository } from "./identity/repositories/platform-invitation.repository.js";
import { PlatformPermissionRepository } from "./identity/repositories/platform-permission.reposiitory.js";
import { PlatformRolePermissionRepository } from "./identity/repositories/platform-role-permission.repository.js";
import { PlatformRoleRepository } from "./identity/repositories/platform-role.repository.js";
import { PlatformSessionRepository } from "./identity/repositories/platform-session.repository.js";
import { PlatformUserRoleRepository } from "./identity/repositories/platform-user-role.repository.js";
import { PlatformUserRepository } from "./identity/repositories/platform-user.repository.js";
import { PlatformTenantRepository } from "./tenants/repositories/platform-tenant.repository.js";

export class PlatformRepositoryRegistry {
    //Identity Repositories
    readonly platformInvitation: PlatformInvitationRepository;
    readonly platformPermission: PlatformPermissionRepository;
    readonly platformRolePermission: PlatformRolePermissionRepository;
    readonly platformRole: PlatformRoleRepository;
    readonly platformSession: PlatformSessionRepository;
    readonly platformUserRole: PlatformUserRoleRepository;
    readonly platformUser: PlatformUserRepository;

    //Audit Repositories
   

    //Tenants Management Repository 
    readonly tenants: PlatformTenantRepository
    readonly tenantsProjection: PlatformTenantProjectionRepository


    //Analytics
    readonly analyticsDaily: PlatformDailyMetricRepository;
    readonly analytics: PlatformAnalyticsRepository;
    readonly analyticsRevenue: PlatformRevenueRepository;
    readonly analyticsEvents: PlatformProjectionEventRepository;

    //Audit Repositories
    readonly audits: PlatformAuditRepository

    constructor(){
        //Identity
        this.platformInvitation = new PlatformInvitationRepository();
        this.platformPermission = new PlatformPermissionRepository();
        this.platformRolePermission = new PlatformRolePermissionRepository();
        this.platformRole = new PlatformRoleRepository()
        this.platformSession = new PlatformSessionRepository();
        this.platformUserRole = new PlatformUserRoleRepository()
        this.platformUser = new PlatformUserRepository

        //Tenants
        this.tenants = new PlatformTenantRepository();
        this.tenantsProjection = new PlatformTenantProjectionRepository();

        //Analytics
        this.analyticsDaily = new PlatformDailyMetricRepository();
        this.analytics = new PlatformAnalyticsRepository()
        this.analyticsRevenue = new PlatformRevenueRepository();
        this.analyticsEvents = new PlatformProjectionEventRepository();

        //Audits 

        this.audits = new PlatformAuditRepository();
    }
}