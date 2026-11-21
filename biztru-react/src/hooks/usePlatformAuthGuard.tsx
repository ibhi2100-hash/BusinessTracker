
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

import {
  usePlatformSession,
} from "../Biztru/services/PlatformSession/PlatformSessionContext";

/* ------------------------------------------------------------------ */
/* AUTHORIZATION TYPES                                                */
/* ------------------------------------------------------------------ */

export type PlatformRole = string;
export type PlatformPermission = string;

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
/* MUTABLE PERMISSIONS                                                */
/*                                                                      */
/* These are permission codes confirmed by the supplied /me response. */
/* A permission is never granted by this list. It must also be present */
/* in session.authorization.permissions.                              */
/* ------------------------------------------------------------------ */

const MUTABLE_PERMISSIONS: readonly PlatformPermission[] = [
  "platform.users.invite",
  "platform.users.manage",
  "platform.users.sessions.revoke",

  "platform.roles.manage",
  "platform.roles.assign",
  "platform.roles.permissions.manage",

  "platform.permissions.manage",

  "platform.tenants.suspend",
  "platform.tenants.reactivate",

  "platform.analytics.projections.rebuild",
];

/* ------------------------------------------------------------------ */
/* ROUTE ACCESS                                                       */
/* ------------------------------------------------------------------ */

export interface PlatformRouteAccess {
  role: PlatformRole | null;
  roles: readonly PlatformRole[];
  context: PlatformAccessContext;
  readOnly: boolean;
  permissions: readonly PlatformPermission[];

  can: (permission: PlatformPermission) => boolean;
  canMutate: (permission: PlatformPermission) => boolean;
}

/* ------------------------------------------------------------------ */
/* DEFAULT ACCESS                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_ACCESS: PlatformRouteAccess = {
  role: null,
  roles: [],
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

export function usePlatformAccess(): PlatformRouteAccess {
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
/* LOADING VIEW                                                       */
/* ------------------------------------------------------------------ */

function PlatformAuthLoading() {
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

/* ------------------------------------------------------------------ */
/* UNAUTHORIZED VIEW                                                  */
/* ------------------------------------------------------------------ */

function PlatformUnauthorized() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="max-w-md text-center">
        <div className="text-4xl font-semibold text-red-400">
          403
        </div>

        <h1 className="mt-4 text-xl font-semibold">
          Access denied
        </h1>

        <p className="mt-2 text-sm text-neutral-400">
          Your platform account does not have permission to access
          this resource.
        </p>

        <button
          type="button"
          onClick={handleGoBack}
          className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Go back
        </button>
      </div>
    </div>
  );
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

  const {
    session,
    status,
  } = usePlatformSession();

  /* ---------------------------------------------------------------- */
  /* SESSION INITIALIZATION                                           */
  /* ---------------------------------------------------------------- */

  if (status === "INITIALIZING") {
    return <PlatformAuthLoading />;
  }

  /* ---------------------------------------------------------------- */
  /* AUTHENTICATION                                                   */
  /* ---------------------------------------------------------------- */

  const user = session?.user ?? null;

  if (requireAuth && (!user || status !== "AUTHENTICATED")) {
    return (
      <Navigate
        to="/command/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* ---------------------------------------------------------------- */
  /* PUBLIC ROUTE                                                     */
  /* ---------------------------------------------------------------- */

  if (!user) {
    return (
      <PlatformAccessContextProvider.Provider
        value={DEFAULT_ACCESS}
      >
        {children ?? <Outlet />}
      </PlatformAccessContextProvider.Provider>
    );
  }

  /* ---------------------------------------------------------------- */
  /* ACCOUNT STATUS                                                   */
  /* ---------------------------------------------------------------- */

  if (user.status !== "ACTIVE") {
    return <PlatformUnauthorized />;
  }

  /* ---------------------------------------------------------------- */
  /* BACKEND-ASSIGNED ROLES                                           */
  /* ---------------------------------------------------------------- */

  const assignedRoles: PlatformRole[] = (
    session.authorization?.roles ?? []
  ).map((role) => role.code);

  /* ---------------------------------------------------------------- */
  /* BACKEND-ASSIGNED PERMISSIONS                                     */
  /* ---------------------------------------------------------------- */

  // Do not filter these by context. The backend is authoritative.
  const assignedPermissions: PlatformPermission[] = [
    ...new Set(
      session.authorization?.permissions ?? []
    ),
  ];

  const permissionSet = new Set(assignedPermissions);

  /* ---------------------------------------------------------------- */
  /* ROLE VALIDATION                                                  */
  /* ---------------------------------------------------------------- */

  if (
    roles?.length &&
    !roles.some((requiredRole) =>
      assignedRoles.includes(requiredRole)
    )
  ) {
    return <PlatformUnauthorized />;
  }

  /* ---------------------------------------------------------------- */
  /* READ-ONLY POLICY                                                 */
  /* ---------------------------------------------------------------- */

  const isReadOnly =
    readOnly ||
    assignedRoles.some((role) =>
      readOnlyRoles.includes(role)
    );

  /* ---------------------------------------------------------------- */
  /* AUTHORIZATION FUNCTIONS                                         */
  /* ---------------------------------------------------------------- */

  const can = (
    permission: PlatformPermission
  ): boolean => {
    return permissionSet.has(permission);
  };

  const canMutate = (
    permission: PlatformPermission
  ): boolean => {
    return (
      !isReadOnly &&
      MUTABLE_PERMISSIONS.includes(permission) &&
      permissionSet.has(permission)
    );
  };

  /* ---------------------------------------------------------------- */
  /* ROUTE PERMISSION REQUIREMENTS                                    */
  /* ---------------------------------------------------------------- */

  if (
    permissions?.length &&
    !permissions.every((permission) => can(permission))
  ) {
    return <PlatformUnauthorized />;
  }

  /* ---------------------------------------------------------------- */
  /* ROUTE ACCESS                                                     */
  /* ---------------------------------------------------------------- */

  const routeAccess: PlatformRouteAccess = {
    role: assignedRoles[0] ?? null,
    roles: assignedRoles,
    context,
    readOnly: isReadOnly,
    permissions: assignedPermissions,
    can,
    canMutate,
  };

  /* ---------------------------------------------------------------- */
  /* RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <PlatformAccessContextProvider.Provider
      value={routeAccess}
    >
      {children ?? <Outlet />}
    </PlatformAccessContextProvider.Provider>
  );
}
