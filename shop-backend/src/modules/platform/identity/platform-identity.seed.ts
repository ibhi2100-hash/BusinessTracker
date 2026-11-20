import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

/* ============================================================
   PERMISSION DEFINITIONS
============================================================ */

const identityPermissions = [
    {
        code: "platform.users.read",
        name: "View platform users",
        module: "identity",
    },
    {
        code: "platform.users.invite",
        name: "Invite platform users",
        module: "identity",
    },
    {
        code: "platform.users.manage",
        name: "Manage platform users",
        module: "identity",
    },
    {
        code: "platform.users.sessions.revoke",
        name: "Revoke platform sessions",
        module: "identity",
    },
    {
        code: "platform.roles.read",
        name: "View platform roles",
        module: "identity",
    },
    {
        code: "platform.roles.manage",
        name: "Manage platform roles",
        module: "identity",
    },
    {
        code: "platform.roles.assign",
        name: "Assign roles to platform users",
        module: "identity",
    },
    {
        code: "platform.roles.permissions.manage",
        name: "Manage role permissions",
        module: "identity",
    },
    {
        code: "platform.permissions.read",
        name: "View platform permissions",
        module: "identity",
    },
    {
        code: "platform.permissions.manage",
        name: "Manage platform permissions",
        module: "identity",
    },
] as const;

const tenantPermissions = [
    {
        code: "platform.tenants.read",
        name: "View tenant directory and tenant details",
        module: "tenants",
    },
    {
        code: "platform.tenants.branches.read",
        name: "View tenant branches",
        module: "tenants",
    },
    {
        code: "platform.tenants.employees.read",
        name: "View tenant employee summaries",
        module: "tenants",
    },
    {
        code: "platform.tenants.operations.read",
        name: "View tenant operational status",
        module: "tenants",
    },
    {
        code: "platform.tenants.suspend",
        name: "Suspend a tenant",
        module: "tenants",
    },
    {
        code: "platform.tenants.reactivate",
        name: "Reactivate a tenant",
        module: "tenants",
    },
] as const;

const analyticsPermissions = [
    {
        code: "platform.analytics.read",
        name: "View platform analytics",
        module: "analytics",
    },
    {
        code: "platform.analytics.revenue.read",
        name: "View platform revenue analytics",
        module: "analytics",
    },
    {
        code: "platform.analytics.projections.read",
        name: "View projection health",
        module: "analytics",
    },
    {
        code: "platform.analytics.projections.rebuild",
        name: "Rebuild platform projections",
        module: "analytics",
    },
] as const;

const auditPermissions = [
    {
        code: "platform.audit.read",
        name: "View platform audit records",
        module: "audit",
    },
    {
        code: "platform.audit.business.read",
        name: "View tenant administrative history",
        module: "audit",
    },
] as const;

/**
 * All platform permissions are registered here.
 *
 * Add future module permissions to this collection.
 */
const permissionDefinitions = [
    ...identityPermissions,
    ...tenantPermissions,
    ...analyticsPermissions,
    ...auditPermissions,
] as const;


/* ============================================================
   ROLE DEFINITIONS
============================================================ */

const roleDefinitions = [
    {
        code: "FOUNDER",
        name: "Founder",
        description: "Full platform ownership and control",
        isSystem: true,
    },
    {
        code: "SUPER_ADMIN",
        name: "Super Administrator",
        description: "General platform administration",
        isSystem: true,
    },
    {
        code: "BILLING_ADMIN",
        name: "Billing Administrator",
        description: "Billing operations",
        isSystem: true,
    },
    {
        code: "FINANCE_ADMIN",
        name: "Finance Administrator",
        description: "Platform financial operations",
        isSystem: true,
    },
    {
        code: "SUPPORT_MANAGER",
        name: "Support Manager",
        description: "Customer support administration",
        isSystem: true,
    },
    {
        code: "SUPPORT_AGENT",
        name: "Support Agent",
        description: "Customer support operations",
        isSystem: true,
    },
    {
        code: "ANALYST",
        name: "Platform Analyst",
        description: "Read-only platform analysis",
        isSystem: true,
    },
    {
        code: "SECURITY_ADMIN",
        name: "Security Administrator",
        description: "Platform identity and security administration",
        isSystem: true,
    },
] as const;


/* ============================================================
   ROLE-PERMISSION ASSIGNMENTS
============================================================ */

/**
 * Explicitly defines which permissions each system role receives.
 *
 * Roles with no permissions here remain unprivileged until their
 * module permissions have been implemented and assigned.
 */
const rolePermissionAssignments: Record<
    string,
    readonly string[]
> = {
    FOUNDER: permissionDefinitions.map(
        (permission) => permission.code
    ),

    SUPER_ADMIN: permissionDefinitions.map(
        (permission) => permission.code
    ),

    SECURITY_ADMIN: [
        "platform.users.read",
        "platform.users.manage",
        "platform.users.sessions.revoke",
        "platform.roles.read",
        "platform.permissions.read",
        "platform.audit.read",
    ],

    ANALYST: [
        "platform.analytics.read",
        "platform.analytics.revenue.read",
        "platform.analytics.projections.read",
        "platform.tenants.read",
    ],

    SUPPORT_MANAGER: [
        "platform.tenants.read",
        "platform.tenants.branches.read",
        "platform.tenants.employees.read",
        "platform.tenants.operations.read",
        "platform.audit.business.read",
    ],

    SUPPORT_AGENT: [
        "platform.tenants.read",
        "platform.tenants.branches.read",
        "platform.tenants.employees.read",
    ],

    /**
     * Billing and finance permissions will be assigned
     * when their respective permission definitions exist.
     */
    BILLING_ADMIN: [],

    FINANCE_ADMIN: [],
};


/* ============================================================
   RBAC SEED
============================================================ */

export async function seedPlatformRbac(): Promise<void> {
    await prisma.$transaction(async (tx) => {

        /* ----------------------------------------------------
           1. SEED PERMISSIONS
        ---------------------------------------------------- */

        const permissionRecords: Array<{
            id: string;
            code: string;
        }> = [];

        for (const definition of permissionDefinitions) {
            const permission = await tx.platformPermission.upsert({
                where: {
                    code: definition.code,
                },

                update: {
                    name: definition.name,
                    module: definition.module,
                },

                create: {
                    code: definition.code,
                    name: definition.name,
                    module: definition.module,
                },
            });

            permissionRecords.push({
                id: permission.id,
                code: permission.code,
            });
        }


        /* ----------------------------------------------------
           2. SEED SYSTEM ROLES
        ---------------------------------------------------- */

        const roleRecords: Array<{
            id: string;
            code: string;
        }> = [];

        for (const definition of roleDefinitions) {
            const role = await tx.platformRole.upsert({
                where: {
                    code: definition.code,
                },

                update: {
                    name: definition.name,
                    description: definition.description,
                    isSystem: true,
                    isActive: true,
                },

                create: {
                    code: definition.code,
                    name: definition.name,
                    description: definition.description,
                    isSystem: true,
                    isActive: true,
                },
            });

            roleRecords.push({
                id: role.id,
                code: role.code,
            });
        }


        /* ----------------------------------------------------
           3. BUILD PERMISSION LOOKUP
        ---------------------------------------------------- */

        const permissionIdByCode = new Map(
            permissionRecords.map((permission) => [
                permission.code,
                permission.id,
            ])
        );


        /* ----------------------------------------------------
           4. ASSIGN PERMISSIONS TO ROLES
        ---------------------------------------------------- */

        for (const role of roleRecords) {
            const permissionCodes =
                rolePermissionAssignments[role.code] ?? [];

            for (const permissionCode of permissionCodes) {
                const permissionId =
                    permissionIdByCode.get(permissionCode);

                if (!permissionId) {
                    throw new Error(
                        `RBAC seed failed: permission "${permissionCode}" does not exist`
                    );
                }

                await tx.platformRolePermission.upsert({
                    where: {
                        platformRoleId_permissionId: {
                            platformRoleId: role.id,
                            permissionId,
                        },
                    },

                    update: {},

                    create: {
                        platformRoleId: role.id,
                        permissionId,
                    },
                });
            }
        }
    });

    console.log("[PLATFORM] RBAC seeding completed successfully.");
}