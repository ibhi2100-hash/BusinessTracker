
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
  useApplicationSession,
} from "../Biztru/context/AplicationSessionContext";

/* ------------------------------------------------------------------ */
/* Roles                                                              */
/* ------------------------------------------------------------------ */

export type Role =
  | "CEO"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "SALES_REPS"
  | "CLEANER";

/* ------------------------------------------------------------------ */
/* Permissions                                                        */
/* ------------------------------------------------------------------ */

export type Permission =
  | "business:read"
  | "business:manage"
  | "branch:read"
  | "branch:write"
  | "sales:read"
  | "sales:create"
  | "sales:refund"
  | "inventory:read"
  | "inventory:write"
  | "finance:read"
  | "finance:write"
  | "reports:read"
  | "team:read"
  | "team:manage"
  | "settings:manage"
  | "billing:manage"
  | "sync:read"
  | "sync:manage"
  | "cleaning:read"
  | "cleaning:manage";

/**
 * Role permissions define what a user is authorized to do.
 *
 * Read-only branch supervision is deliberately separated from
 * branch operational permissions.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  CEO: [
    "business:read",
    "business:manage",
    "branch:read",
    "sales:read",
    "inventory:read",
    "finance:read",
    "reports:read",
    "team:read",
    "team:manage",
    "settings:manage",
    "billing:manage",
    "sync:read",
  ],

  ADMIN: [
    "business:read",
    "business:manage",
    "branch:read",
    "sales:read",
    "inventory:read",
    "finance:read",
    "reports:read",
    "team:read",
    "team:manage",
    "settings:manage",
    "billing:manage",
    "sync:read",
    "sync:manage",
  ],

  MANAGER: [
    "branch:read",
    "branch:write",
    "sales:read",
    "sales:create",
    "inventory:read",
    "inventory:write",
    "finance:read",
    "finance:write",
    "reports:read",
    "team:read",
    "sync:read",
    "sync:manage",
  ],

  STAFF: [
    "branch:read",
    "sales:read",
    "sales:create",
  ],

  SALES_REPS: [
    "branch:read",
    "sales:read",
    "sales:create",
  ],

  CLEANER: [
    "branch:read",
    "cleaning:read",
    "cleaning:manage",
  ],
};

/* ------------------------------------------------------------------ */
/* Route access context                                               */
/* ------------------------------------------------------------------ */

export interface RouteAccess {
  role: Role | null;
  readOnly: boolean;
  permissions: readonly Permission[];
  can: (permission: Permission) => boolean;
  canMutate: (permission: Permission) => boolean;
}

const DEFAULT_ROUTE_ACCESS: RouteAccess = {
  role: null,
  readOnly: true,
  permissions: [],
  can: () => false,
  canMutate: () => false,
};

const RouteAccessContext = createContext<RouteAccess>(
  DEFAULT_ROUTE_ACCESS,
);

export function useRouteAccess(): RouteAccess {
  return useContext(RouteAccessContext);
}

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

interface AuthGuardProps {
  requireAuth?: boolean;
  requireBusiness?: boolean;
  blockIfOnboarding?: boolean;
  requireOnboarding?: boolean;

  /** Roles permitted to enter this route. */
  roles?: Role[];

  /** Every requested permission must be present. */
  permissions?: Permission[];

  /** Roles that may enter but must be restricted to read-only UI. */
  readOnlyRoles?: Role[];

  /** Force read-only access for every permitted role. */
  readOnly?: boolean;

  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* Role validation                                                    */
/* ------------------------------------------------------------------ */

function isRole(value: unknown): value is Role {
  return (
    value === "CEO" ||
    value === "ADMIN" ||
    value === "MANAGER" ||
    value === "STAFF" ||
    value === "SALES_REPS" ||
    value === "CLEANER"
  );
}

/* ------------------------------------------------------------------ */
/* AuthGuard                                                          */
/* ------------------------------------------------------------------ */

export function AuthGuard({
  requireAuth = true,
  requireBusiness = false,
  blockIfOnboarding = false,
  requireOnboarding = false,
  roles,
  permissions,
  readOnlyRoles = [],
  readOnly = false,
  children,
}: AuthGuardProps) {
  const location = useLocation();

  const { session } = useApplicationSession();

  /* -------------------------------------------------------------- */
  /* Authentication                                                  */
  /* -------------------------------------------------------------- */

  if (requireAuth && !session.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Business                                                        */
  /* -------------------------------------------------------------- */

  if (requireBusiness && !session.business) {
    return (
      <Navigate
        to="/onboarding-business"
        replace
        state={{ from: location }}
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Onboarding required                                             */
  /* -------------------------------------------------------------- */

  if (
    requireOnboarding &&
    session.business &&
    !session.business.isOnboarding
  ) {
    return (
      <Navigate
        to="/app"
        replace
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Block application during onboarding                            */
  /* -------------------------------------------------------------- */

  if (
    blockIfOnboarding &&
    session.business?.isOnboarding
  ) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Resolve role                                                    */
  /* -------------------------------------------------------------- */

  const userRole = session.user?.role;

  const role: Role | null = isRole(userRole)
    ? userRole
    : null;

  /* -------------------------------------------------------------- */
  /* Role authorization                                              */
  /* -------------------------------------------------------------- */

  if (roles && (!role || !roles.includes(role))) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Resolve permissions                                             */
  /* -------------------------------------------------------------- */

  const userPermissions = role
    ? ROLE_PERMISSIONS[role]
    : [];

  if (permissions?.length) {
    const hasAllPermissions = permissions.every(
      (permission) =>
        userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  /* -------------------------------------------------------------- */
  /* Read-only access                                                */
  /* -------------------------------------------------------------- */

  const isReadOnly =
    readOnly ||
    (!!role && readOnlyRoles.includes(role));

  const routeAccess: RouteAccess = {
  role,
  readOnly: isReadOnly,
  permissions: userPermissions,

  // Checks whether the user's role has a permission.
  // Read-only pages can still use this to display information.
  can: (permission) =>
    userPermissions.includes(permission),

  // Checks whether the user may perform an operation
  // in the current route context.
  canMutate: (permission) =>
    !isReadOnly &&
    userPermissions.includes(permission),
};

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */

  return (
    <RouteAccessContext.Provider value={routeAccess}>
      {children ?? <Outlet />}
    </RouteAccessContext.Provider>
  );
}
