
// src/hooks/command/usePlatformAuthGuard.tsx

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { usePlatformSession, type PlatformRole, type PlatformPermission } from "../Biztru/services/PlatformSessionContext";


/* ------------------------------------------------------------------ */
/* ROLE PERMISSIONS                                                   */
/* ------------------------------------------------------------------ */

export const PLATFORM_ROLE_PERMISSIONS: Record<
  PlatformRole,
  readonly PlatformPermission[]
> = {

  /* ================================================================ */
  /* FOUNDER                                                          */
  /* ================================================================ */

  FOUNDER: [
    "platform:dashboard:read",

    "tenant:read",
    "tenant:manage",
    "tenant:suspend",
    "tenant:activate",

    "commercial:read",
    "commercial:manage",
    "subscription:read",
    "subscription:manage",
    "invoice:read",
    "invoice:manage",
    "payment:read",

    "entitlement:read",
    "entitlement:manage",

    "intelligence:read",
    "analytics:read",

    "support:read",
    "support:manage",

    "governance:read",
    "audit:read",
    "security:manage",

    "infrastructure:read",
    "infrastructure:manage",

    "platform:users:read",
    "platform:users:manage",
    "platform:settings:manage",
  ],

  /* ================================================================ */
  /* PLATFORM ADMIN                                                   */
  /* ================================================================ */

  PLATFORM_ADMIN: [
    "platform:dashboard:read",

    "tenant:read",
    "tenant:manage",
    "tenant:activate",

    "entitlement:read",
    "intelligence:read",
    "analytics:read",

    "support:read",

    "governance:read",
    "audit:read",

    "platform:users:read",
  ],

  /* ================================================================ */
  /* BILLING OPERATOR                                                 */
  /* ================================================================ */

  BILLING_OPERATOR: [
    "platform:dashboard:read",

    "tenant:read",

    "commercial:read",
    "commercial:manage",

    "subscription:read",
    "subscription:manage",

    "invoice:read",
    "invoice:manage",

    "payment:read",

    "entitlement:read",
    "entitlement:manage",
  ],

  /* ================================================================ */
  /* SUPPORT OPERATOR                                                 */
  /* ================================================================ */

  SUPPORT_OPERATOR: [
    "platform:dashboard:read",

    "tenant:read",

    "support:read",
    "support:manage",

    "intelligence:read",
  ],

  /* ================================================================ */
  /* SECURITY ADMIN                                                   */
  /* ================================================================ */

  SECURITY_ADMIN: [
    "platform:dashboard:read",

    "tenant:read",

    "governance:read",
    "audit:read",
    "security:manage",

    "platform:users:read",
  ],

  /* ================================================================ */
  /* PLATFORM ENGINEER                                                */
  /* ================================================================ */

  PLATFORM_ENGINEER: [
    "platform:dashboard:read",

    "infrastructure:read",
    "infrastructure:manage",

    "governance:read",
    "audit:read",
  ],

  /* ================================================================ */
  /* PLATFORM ANALYST                                                 */
  /* ================================================================ */

  PLATFORM_ANALYST: [
    "platform:dashboard:read",

    "tenant:read",

    "intelligence:read",
    "analytics:read",

    "commercial:read",
    "subscription:read",
    "payment:read",

    "infrastructure:read",

    "governance:read",
    "audit:read",
  ],
};

/* ------------------------------------------------------------------ */
/* ACCESS CONTEXT                                                     */
/* ------------------------------------------------------------------ */

export type PlatformAccessContext =

  | "PLATFORM"

  | "TENANT_MANAGEMENT"

  | "COMMERCIAL"

  | "ENTITLEMENTS"

  | "INTELLIGENCE"

  | "SUPPORT"

  | "GOVERNANCE"

  | "INFRASTRUCTURE";

/* ------------------------------------------------------------------ */
/* CONTEXT PERMISSIONS                                                */
/* ------------------------------------------------------------------ */

const CONTEXT_PERMISSIONS: Record<
  PlatformAccessContext,
  readonly PlatformPermission[]
> = {

  PLATFORM: [
    "platform:dashboard:read",
    "platform:users:read",
    "platform:users:manage",
    "platform:settings:manage",
  ],

  TENANT_MANAGEMENT: [
    "tenant:read",
    "tenant:manage",
    "tenant:suspend",
    "tenant:activate",
  ],

  COMMERCIAL: [
    "commercial:read",
    "commercial:manage",
    "subscription:read",
    "subscription:manage",
    "invoice:read",
    "invoice:manage",
    "payment:read",
  ],

  ENTITLEMENTS: [
    "entitlement:read",
    "entitlement:manage",
  ],

  INTELLIGENCE: [
    "intelligence:read",
    "analytics:read",
  ],

  SUPPORT: [
    "support:read",
    "support:manage",
  ],

  GOVERNANCE: [
    "governance:read",
    "audit:read",
    "security:manage",
  ],

  INFRASTRUCTURE: [
    "infrastructure:read",
    "infrastructure:manage",
  ],
};

/* ------------------------------------------------------------------ */
/* MUTABLE PERMISSIONS                                                */
/* ------------------------------------------------------------------ */

const MUTABLE_PERMISSIONS: readonly PlatformPermission[] = [

  "tenant:manage",
  "tenant:suspend",
  "tenant:activate",

  "commercial:manage",

  "subscription:manage",

  "invoice:manage",

  "entitlement:manage",

  "support:manage",

  "security:manage",

  "infrastructure:manage",

  "platform:users:manage",

  "platform:settings:manage",
];

/* ------------------------------------------------------------------ */
/* ROLE VALIDATION                                                    */
/* ------------------------------------------------------------------ */

function isPlatformRole(
  value: unknown,
): value is PlatformRole {

  return (
    value === "FOUNDER" ||
    value === "PLATFORM_ADMIN" ||
    value === "BILLING_OPERATOR" ||
    value === "SUPPORT_OPERATOR" ||
    value === "SECURITY_ADMIN" ||
    value === "PLATFORM_ENGINEER" ||
    value === "PLATFORM_ANALYST"
  );
}

/* ------------------------------------------------------------------ */
/* ROUTE ACCESS                                                       */
/* ------------------------------------------------------------------ */

export interface PlatformRouteAccess {

  role: PlatformRole | null;

  context: PlatformAccessContext;

  readOnly: boolean;

  permissions: readonly PlatformPermission[];

  can: (
    permission: PlatformPermission,
  ) => boolean;

  canMutate: (
    permission: PlatformPermission,
  ) => boolean;
}

/* ------------------------------------------------------------------ */
/* DEFAULT ACCESS                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_ACCESS: PlatformRouteAccess = {

  role: null,

  context: "PLATFORM",

  readOnly: true,

  permissions: [],

  can: () => false,

  canMutate: () => false,
};

const PlatformAccessContextProvider =
  createContext<PlatformRouteAccess>(DEFAULT_ACCESS);

/* ------------------------------------------------------------------ */
/* ACCESS HOOK                                                        */
/* ------------------------------------------------------------------ */

export function usePlatformAccess() {
  return useContext(PlatformAccessContextProvider);
}

/* ------------------------------------------------------------------ */
/* GUARD PROPS                                                        */
/* ------------------------------------------------------------------ */

interface PlatformAuthGuardProps {

  requireAuth?: boolean;

  roles?: PlatformRole[];

  permissions?: PlatformPermission[];

  readOnlyRoles?: PlatformRole[];

  readOnly?: boolean;

  context?: PlatformAccessContext;

  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* AUTH GUARD                                                         */
/* ------------------------------------------------------------------ */

export function PlatformAuthGuard({

  requireAuth = true,

  roles,

  permissions,

  readOnlyRoles = [],

  readOnly = false,

  context = "PLATFORM",

  children,

}: PlatformAuthGuardProps) {

  const location = useLocation();

  const { session, status } = usePlatformSession();

  /* ================================================================ */
  /* SESSION INITIALIZATION                                           */
  /* ================================================================ */

  if (status === "INITIALIZING") {

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-teal-400" />

          <p className="mt-4 text-sm text-neutral-400">
            Verifying platform access...
          </p>

        </div>

      </div>
    );
  }

  /* ================================================================ */
  /* AUTHENTICATION                                                   */
  /* ================================================================ */

  if (
    requireAuth &&
    (
      status !== "AUTHENTICATED" ||
      !session.user
    )
  ) {

    return (
      <Navigate
        to="/platform/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /* ================================================================ */
  /* PLATFORM ACCOUNT VALIDATION                                      */
  /* ================================================================ */

  const user = session.user;

  if (!user || !user.isActive) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* ================================================================ */
  /* ROLE RESOLUTION                                                  */
  /* ================================================================ */

  const role: PlatformRole | null =
    isPlatformRole(user.role)
      ? user.role
      : null;

  if (!role) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* ================================================================ */
  /* ROLE AUTHORIZATION                                               */
  /* ================================================================ */

  if (
    roles &&
    !roles.includes(role)
  ) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* ================================================================ */
  /* ROLE DEFAULT PERMISSIONS                                         */
  /* ================================================================ */

  const rolePermissions =
    PLATFORM_ROLE_PERMISSIONS[role];

  /* ================================================================ */
  /* TRUSTED ASSIGNED PERMISSIONS                                     */
  /* ================================================================ */

  const assignedPermissions: readonly PlatformPermission[] = [
    ...new Set<PlatformPermission>([
      ...rolePermissions,
      ...user.permissions,
    ]),
  ];

  /* ================================================================ */
  /* CONTEXT PERMISSION FILTER                                        */
  /* ================================================================ */

  const allowedContextPermissions =
    CONTEXT_PERMISSIONS[context];

  const effectivePermissions =
    assignedPermissions.filter(
      (permission) =>
        allowedContextPermissions.includes(permission),
    );

  /* ================================================================ */
  /* READ-ONLY POLICY                                                 */
  /* ================================================================ */

  const isReadOnly =
    readOnly ||
    readOnlyRoles.includes(role);

  /* ================================================================ */
  /* AUTHORIZATION FUNCTIONS                                         */
  /* ================================================================ */

  const can = (
    permission: PlatformPermission,
  ): boolean => {

    return effectivePermissions.includes(permission);
  };

  const canMutate = (
    permission: PlatformPermission,
  ): boolean => {

    return (
      !isReadOnly &&
      MUTABLE_PERMISSIONS.includes(permission) &&
      effectivePermissions.includes(permission)
    );
  };

  /* ================================================================ */
  /* ROUTE PERMISSION REQUIREMENTS                                    */
  /* ================================================================ */

  if (
    permissions?.length &&
    !permissions.every((permission) => can(permission))
  ) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* ================================================================ */
  /* ROUTE ACCESS                                                     */
  /* ================================================================ */

  const routeAccess: PlatformRouteAccess = {

    role,

    context,

    readOnly: isReadOnly,

    permissions: effectivePermissions,

    can,

    canMutate,
  };

  /* ================================================================ */
  /* RENDER                                                           */
  /* ================================================================ */

  return (

    <PlatformAccessContextProvider.Provider value={routeAccess}>

      {children ?? <Outlet />}

    </PlatformAccessContextProvider.Provider>

  );
}
