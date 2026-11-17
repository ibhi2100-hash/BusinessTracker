
// hooks/useAuthGuard.tsx

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
/* ROLES                                                              */
/* ------------------------------------------------------------------ */

export type Role =
  | "CEO"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "SALES_REPS"
  | "CLEANER";

/* ------------------------------------------------------------------ */
/* PERMISSIONS                                                        */
/* ------------------------------------------------------------------ */

export type Permission =
  // Business
  | "business:read"
  | "business:manage"
  | "business:setup"

  // Branch administration
  | "branch:create"
  | "branch:manage"
  | "branch:assign-manager"
  | "branch:initialize"
  | "branch:read"

  // Sales
  | "sales:read"
  | "sales:create"
  | "sales:refund"

  // Inventory
  | "inventory:read"
  | "inventory:write"
  | "inventory:receive"
  | "inventory:adjust"
  | "inventory:transfer"

  // Finance
  | "finance:read"
  | "finance:write"

  // Reports
  | "reports:read"

  // Team
  | "team:read"
  | "team:manage"

  // Settings and billing
  | "settings:manage"
  | "billing:manage"

  // Synchronization
  | "sync:read"
  | "sync:manage"

  // Cleaning
  | "cleaning:read"
  | "cleaning:manage";

/* ------------------------------------------------------------------ */
/* DEFAULT ROLE PERMISSIONS                                           */
/* ------------------------------------------------------------------ */

/**
 * Default permissions assigned to each role.
 *
 * These are role defaults, not the complete authorization policy.
 * Trusted business memberships and branch assignments may extend
 * these permissions.
 *
 * CEO:
 * Business owner with business-level administrative authority.
 *
 * ADMIN:
 * Business administrator with branch administration authority.
 *
 * MANAGER:
 * Operational authority within assigned branches.
 *
 * STAFF / SALES_REPS:
 * Restricted operational access.
 *
 * CLEANER:
 * Cleaning-specific access.
 */

export const ROLE_PERMISSIONS: Record<
  Role,
  readonly Permission[]
> = {
  /* ================================================================ */
  /* CEO                                                              */
  /* ================================================================ */

  CEO: [
    // Business administration
    "business:read",
    "business:manage",
    "business:setup",

    // Branch administration
    "branch:create",
    "branch:manage",
    "branch:assign-manager",
    "branch:initialize",
    "branch:read",

    // Business oversight
    "sales:read",
    "inventory:read",
    "finance:read",
    "reports:read",

    // Team administration
    "team:read",
    "team:manage",

    // Business settings
    "settings:manage",
    "billing:manage",

    // Synchronization
    "sync:read",
    "sync:manage",
  ],

  /* ================================================================ */
  /* ADMIN                                                            */
  /* ================================================================ */

  ADMIN: [
    // Business visibility
    "business:read",

    // Branch administration
    "branch:read",
    "branch:create",
    "branch:manage",
    "branch:assign-manager",
    "branch:initialize",

    // Operational visibility
    "sales:read",
    "inventory:read",
    "finance:read",
    "reports:read",

    // Team administration
    "team:read",
    "team:manage",

    // Business settings
    "settings:manage",
    "billing:manage",
    // Synchronization visibility
    "sync:read",
  ],

  /* ================================================================ */
  /* MANAGER                                                          */
  /* ================================================================ */

  MANAGER: [
    "branch:read",

    // Sales
    "sales:read",
    "sales:create",
    "sales:refund",

    // Inventory
    "inventory:read",
    "inventory:write",
    "inventory:receive",
    "inventory:adjust",
    "inventory:transfer",

    // Finance
    "finance:read",
    "finance:write",

    // Reports and team
    "reports:read",
    "team:read",
    "team:manage",

    // Synchronization
    "sync:read",
    "sync:manage",
  ],

  /* ================================================================ */
  /* STAFF                                                            */
  /* ================================================================ */

  STAFF: [
    "branch:read",
    "sales:read",
    "sales:create",
  ],

  /* ================================================================ */
  /* SALES REPRESENTATIVE                                             */
  /* ================================================================ */

  SALES_REPS: [
    "branch:read",
    "sales:read",
    "sales:create",
  ],

  /* ================================================================ */
  /* CLEANER                                                          */
  /* ================================================================ */

  CLEANER: [
    "branch:read",
    "cleaning:read",
    "cleaning:manage",
  ],
};

/* ------------------------------------------------------------------ */
/* ACCESS CONTEXTS                                                    */
/* ------------------------------------------------------------------ */

/**
 * BUSINESS:
 * Business-level administration.
 *
 * BRANCH_SETUP:
 * Creating and initializing a branch before activation.
 *
 * BRANCH_OPERATIONS:
 * Normal operations inside an assigned branch.
 *
 * BRANCH_INSPECTION:
 * Read-only inspection of a branch.
 *
 * Actual branch authorization must still validate the resolved
 * businessId and branchId in application commands.
 */

export type AccessContext =
  | {
      type: "BUSINESS";
      businessId?: string;
    }
  | {
      type: "BRANCH_SETUP";
      businessId?: string;
      branchId?: string;
    }
  | {
      type: "BRANCH_OPERATIONS";
      businessId?: string;
      branchId?: string;
    }
  | {
      type: "BRANCH_INSPECTION";
      businessId?: string;
      branchId?: string;
    }
  | {
      type: "BRANCH_CONTROL_ROOM";
      businessId?: string;
      branchId?: string;
    };

/* ------------------------------------------------------------------ */
/* ROUTE ACCESS                                                       */
/* ------------------------------------------------------------------ */

export interface RouteAccess {
  role: Role | null;

  context: AccessContext;

  readOnly: boolean;

  permissions: readonly Permission[];

  can: (permission: Permission) => boolean;

  canMutate: (permission: Permission) => boolean;
}

/* ------------------------------------------------------------------ */
/* DEFAULT ACCESS                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_ROUTE_ACCESS: RouteAccess = {
  role: null,

  context: {
    type: "BUSINESS",
  },

  readOnly: true,

  permissions: [],

  can: () => false,

  canMutate: () => false,
};

const RouteAccessContext = createContext<RouteAccess>(
  DEFAULT_ROUTE_ACCESS,
);

/* ------------------------------------------------------------------ */
/* ROUTE ACCESS HOOK                                                  */
/* ------------------------------------------------------------------ */

export function useRouteAccess(): RouteAccess {
  return useContext(RouteAccessContext);
}

/* ------------------------------------------------------------------ */
/* BUSINESS CONTEXT PERMISSIONS                                       */
/* ------------------------------------------------------------------ */

const BUSINESS_CONTEXT_PERMISSIONS: readonly Permission[] = [
  "business:read",
  "business:manage",
  "business:setup",

  // Branch administration
  "branch:create",
  "branch:manage",
  "branch:assign-manager",
  "branch:read",

  // Team
  "team:read",
  "team:manage",

  // Settings
  "settings:manage",
  "billing:manage",

  // Reports
  "reports:read",

  // Synchronization
  "sync:read",
  "sync:manage",
];

/* ------------------------------------------------------------------ */
/* BRANCH SETUP PERMISSIONS                                           */
/* ------------------------------------------------------------------ */

const BRANCH_SETUP_PERMISSIONS: readonly Permission[] = [
  "business:read",
  "branch:read",
  "branch:initialize",
  "inventory:read",
];

/* ------------------------------------------------------------------ */
/* BRANCH INSPECTION PERMISSIONS                                      */
/* ------------------------------------------------------------------ */

const BRANCH_INSPECTION_PERMISSIONS: readonly Permission[] = [
  "business:read",
  "branch:read",

  "sales:read",
  "inventory:read",
  "finance:read",

  "reports:read",
  "team:read",

  "sync:read",
  "cleaning:read",
];

/* ------------------------------------------------------------------ */
/* BRANCH OPERATIONS PERMISSIONS                                      */
/* ------------------------------------------------------------------ */

const BRANCH_OPERATIONS_PERMISSIONS: readonly Permission[] = [
  "branch:read",

  // Sales
  "sales:read",
  "sales:create",
  "sales:refund",

  // Inventory
  "inventory:read",
  "inventory:write",
  "inventory:receive",
  "inventory:adjust",
  "inventory:transfer",

  // Finance
  "finance:read",
  "finance:write",

  // Reports
  "reports:read",

  // Team
  "team:read",
  "team:manage",

  // Synchronization
  "sync:read",
  "sync:manage",

  // Cleaning
  "cleaning:read",
  "cleaning:manage",
];


/* ------------------------------------------------------------------ */
/* BRANCH CONTROL ROOM PERMISSIONS                                    */
/* ------------------------------------------------------------------ */

/**
 * The Control Room is a business-level administrative workspace
 * focused on one selected branch.
 *
 * It combines business administration visibility with branch
 * operational visibility.
 */
const BRANCH_CONTROL_ROOM_PERMISSIONS: readonly Permission[] = [
  ...new Set<Permission>([
    ...BUSINESS_CONTEXT_PERMISSIONS,
    ...BRANCH_OPERATIONS_PERMISSIONS,
  ]),
];


/* ------------------------------------------------------------------ */
/* MUTABLE BUSINESS PERMISSIONS                                       */
/* ------------------------------------------------------------------ */

/**
 * These permissions represent business-level mutations.
 *
 * CEO and ADMIN can manage branches here.
 *
 * Branch initialization is deliberately separate.
 */

const MUTABLE_BUSINESS_PERMISSIONS: readonly Permission[] = [
  "business:manage",
  "business:setup",

  // Branch administration
  "branch:create",
  "branch:manage",
  "branch:assign-manager",

  // Team administration
  "team:manage",

  // Settings
  "settings:manage",
  "billing:manage",

  // Synchronization
  "sync:manage",
];

/* ------------------------------------------------------------------ */
/* MUTABLE BRANCH SETUP PERMISSIONS                                   */
/* ------------------------------------------------------------------ */

const MUTABLE_SETUP_PERMISSIONS: readonly Permission[] = [
  "branch:initialize",
];

/* ------------------------------------------------------------------ */
/* MUTABLE BRANCH OPERATIONS PERMISSIONS                              */
/* ------------------------------------------------------------------ */

const MUTABLE_OPERATIONAL_PERMISSIONS: readonly Permission[] = [
  // Sales
  "sales:create",
  "sales:refund",

  // Inventory
  "inventory:write",
  "inventory:receive",
  "inventory:adjust",
  "inventory:transfer",

  // Finance
  "finance:write",

  // Team
  "team:manage",

  // Synchronization
  "sync:manage",

  // Cleaning
  "cleaning:manage",
];

/* ------------------------------------------------------------------ */
/* MUTABLE BRANCH CONTROL ROOM PERMISSIONS                            */
/* ------------------------------------------------------------------ */

const MUTABLE_CONTROL_ROOM_PERMISSIONS: readonly Permission[] = [
  ...new Set<Permission>([
    ...MUTABLE_BUSINESS_PERMISSIONS,
    ...MUTABLE_OPERATIONAL_PERMISSIONS,
  ]),
];

/* ------------------------------------------------------------------ */
/* CONTEXT HELPERS                                                    */
/* ------------------------------------------------------------------ */


function getContextPermissions(
  context: AccessContext,
): readonly Permission[] {
  switch (context.type) {
    case "BUSINESS":
      return BUSINESS_CONTEXT_PERMISSIONS;

    case "BRANCH_SETUP":
      return BRANCH_SETUP_PERMISSIONS;

    case "BRANCH_OPERATIONS":
      return BRANCH_OPERATIONS_PERMISSIONS;

    case "BRANCH_INSPECTION":
      return BRANCH_INSPECTION_PERMISSIONS;

    case "BRANCH_CONTROL_ROOM":
      return BRANCH_CONTROL_ROOM_PERMISSIONS;

    default:
      return [];
  }
}


function getMutablePermissions(
  context: AccessContext,
): readonly Permission[] {
  switch (context.type) {
    case "BUSINESS":
      return MUTABLE_BUSINESS_PERMISSIONS;

    case "BRANCH_SETUP":
      return MUTABLE_SETUP_PERMISSIONS;

    case "BRANCH_OPERATIONS":
      return MUTABLE_OPERATIONAL_PERMISSIONS;

    case "BRANCH_INSPECTION":
      return [];

    case "BRANCH_CONTROL_ROOM":
      return MUTABLE_CONTROL_ROOM_PERMISSIONS;

    default:
      return [];
  }
}


/* ------------------------------------------------------------------ */
/* ROLE VALIDATION                                                    */
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
/* GUARD PROPS                                                        */
/* ------------------------------------------------------------------ */

interface AuthGuardProps {
  requireAuth?: boolean;

  requireBusiness?: boolean;

  blockIfOnboarding?: boolean;

  requireOnboarding?: boolean;

  /** Roles permitted to enter this route. */
  roles?: Role[];

  /**
   * Every requested permission must be present.
   *
   * These are permission-presence checks, not mutation checks.
   */
  permissions?: Permission[];

  /**
   * Roles that may enter but must be read-only.
   */
  readOnlyRoles?: Role[];

  /** Force read-only access for every permitted role. */
  readOnly?: boolean;

  /** Explicit access context for the route. */
  context?: AccessContext;

  /**
   * Additional permissions from trusted business membership
   * or branch-assignment data.
   *
   * Never construct these from arbitrary URL parameters or form input.
   */
  grantedPermissions?: readonly Permission[];

  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/* AUTH GUARD                                                         */
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

  context = {
    type: "BUSINESS",
  },

  grantedPermissions = [],

  children,
}: AuthGuardProps) {
  const location = useLocation();

  const { session } = useApplicationSession();

  /* ================================================================ */
  /* AUTHENTICATION                                                   */
  /* ================================================================ */

  if (requireAuth && !session.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /* ================================================================ */
  /* BUSINESS REQUIREMENT                                             */
  /* ================================================================ */

  if (requireBusiness && !session.business) {
    return (
      <Navigate
        to="/onboarding-business"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /* ================================================================ */
  /* ONBOARDING REQUIREMENT                                           */
  /* ================================================================ */

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

  /* ================================================================ */
  /* BLOCK APPLICATION DURING ONBOARDING                              */
  /* ================================================================ */

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

  /* ================================================================ */
  /* RESOLVE ROLE                                                     */
  /* ================================================================ */

  const userRole = session.user?.role;

  const role: Role | null = isRole(userRole)
    ? userRole
    : null;

  /* ================================================================ */
  /* ROLE AUTHORIZATION                                               */
  /* ================================================================ */

  if (roles && (!role || !roles.includes(role))) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* ================================================================ */
  /* BASE ROLE PERMISSIONS                                            */
  /* ================================================================ */

  const rolePermissions: readonly Permission[] = role
    ? ROLE_PERMISSIONS[role]
    : [];

  /* ================================================================ */
  /* MERGE TRUSTED ASSIGNED PERMISSIONS                               */
  /* ================================================================ */

  const assignedPermissions: readonly Permission[] = [
    ...new Set<Permission>([
      ...rolePermissions,
      ...grantedPermissions,
    ]),
  ];

  /* ================================================================ */
  /* CONTEXT PERMISSION FILTER                                        */
  /* ================================================================ */

  const contextPermissions = getContextPermissions(context);

  const effectivePermissions: readonly Permission[] =
    assignedPermissions.filter((permission) =>
      contextPermissions.includes(permission),
    );

  /* ================================================================ */
  /* READ-ONLY POLICY                                                 */
  /* ================================================================ */

  const isReadOnly =
    readOnly ||
    context.type === "BRANCH_INSPECTION" ||
    (!!role && readOnlyRoles.includes(role));

  /* ================================================================ */
  /* AUTHORIZATION FUNCTIONS                                         */
  /* ================================================================ */

  const can = (
    permission: Permission,
  ): boolean => {
    return effectivePermissions.includes(permission);
  };

  const mutablePermissions = getMutablePermissions(context);

  const canMutate = (
    permission: Permission,
  ): boolean => {
    return (
      !isReadOnly &&
      effectivePermissions.includes(permission) &&
      mutablePermissions.includes(permission)
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

  const routeAccess: RouteAccess = {
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
    <RouteAccessContext.Provider value={routeAccess}>
      {children ?? <Outlet />}
    </RouteAccessContext.Provider>
  );
}
  