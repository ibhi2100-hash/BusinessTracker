
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
 * These are default role permissions.
 *
 * They are not the complete authorization policy for every user.
 *
 * Additional permissions can be granted through trusted business
 * memberships and branch assignments.
 *
 * CEO represents the business owner.
 *
 * CEO does not automatically receive operational write access
 * to every branch.
 *
 * ADMIN receives read access by default. Additional administrative
 * permissions must be explicitly assigned.
 */
export const ROLE_PERMISSIONS: Record<
  Role,
  readonly Permission[]
> = {
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

  ADMIN: [
    // Business visibility
    "business:read",
    "branch:read",

    // Operational visibility
    "sales:read",
    "inventory:read",
    "finance:read",
    "reports:read",

    // Team visibility
    "team:read",

    // Synchronization visibility
    "sync:read",
  ],

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

    // Synchronization
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
 * Branch IDs are optional here because some router declarations
 * define a context before the active branch is resolved.
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
    };

/* ------------------------------------------------------------------ */
/* ROUTE ACCESS                                                       */
/* ------------------------------------------------------------------ */

export interface RouteAccess {
  role: Role | null;

  context: AccessContext;

  /**
   * Whether the current page is read-only.
   */
  readOnly: boolean;

  /**
   * Permissions effective in the current context.
   */
  permissions: readonly Permission[];

  /**
   * Checks whether the user has a permission in this context.
   */
  can: (permission: Permission) => boolean;

  /**
   * Checks whether the user can actually perform a mutation.
   */
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

/**
 * Permissions available in the business administration workspace.
 *
 * Branch operational transactions are excluded.
 *
 * Branch initialization is also excluded here. It belongs to
 * BRANCH_SETUP.
 */
const BUSINESS_CONTEXT_PERMISSIONS: readonly Permission[] = [
  "business:read",
  "business:manage",
  "business:setup",

  "branch:create",
  "branch:manage",
  "branch:assign-manager",
  "branch:read",

  "team:read",
  "team:manage",

  "settings:manage",
  "billing:manage",

  "reports:read",

  "sync:read",
  "sync:manage",
];

/* ------------------------------------------------------------------ */
/* BRANCH SETUP PERMISSIONS                                           */
/* ------------------------------------------------------------------ */

/**
 * Branch initialization is a controlled process.
 *
 * It must not automatically grant inventory:write.
 *
 * Opening stock and financial balances must be recorded through
 * dedicated initialization commands.
 */
const BRANCH_SETUP_PERMISSIONS: readonly Permission[] = [
  "business:read",
  "branch:read",

  "branch:initialize",

  "inventory:read",
];

/* ------------------------------------------------------------------ */
/* BRANCH INSPECTION PERMISSIONS                                      */
/* ------------------------------------------------------------------ */

/**
 * Inspection is always read-only.
 *
 * Even if a user has operational permissions elsewhere, those
 * permissions cannot be used in this context.
 */
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

/**
 * Normal operational permissions inside a branch.
 *
 * Business administration permissions are excluded.
 */
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
/* MUTABLE BUSINESS PERMISSIONS                                       */
/* ------------------------------------------------------------------ */

const MUTABLE_BUSINESS_PERMISSIONS: readonly Permission[] = [
  "business:manage",
  "business:setup",

  "branch:create",
  "branch:manage",
  "branch:assign-manager",

  "team:manage",

  "settings:manage",
  "billing:manage",

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
  "sales:create",
  "sales:refund",

  "inventory:write",
  "inventory:receive",
  "inventory:adjust",
  "inventory:transfer",

  "finance:write",

  "team:manage",

  "sync:manage",

  "cleaning:manage",
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

  /**
   * Explicit access context for the route.
   */
  context?: AccessContext;

  /**
   * Additional permissions from trusted business membership
   * or branch-assignment data.
   *
   * Examples:
   * - CEO assigned as manager of a particular branch.
   * - ADMIN explicitly authorized to create branches.
   *
   * These must come from trusted application state.
   * Never construct them from arbitrary URL parameters or form input.
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

  /* -------------------------------------------------------------- */
  /* AUTHENTICATION                                                  */
  /* -------------------------------------------------------------- */

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

  /* -------------------------------------------------------------- */
  /* BUSINESS REQUIREMENT                                           */
  /* -------------------------------------------------------------- */

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

  /* -------------------------------------------------------------- */
  /* ONBOARDING REQUIREMENT                                         */
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
  /* BLOCK APPLICATION DURING ONBOARDING                            */
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
  /* RESOLVE ROLE                                                    */
  /* -------------------------------------------------------------- */

  const userRole = session.user?.role;

  const role: Role | null = isRole(userRole)
    ? userRole
    : null;

  /* -------------------------------------------------------------- */
  /* ROLE AUTHORIZATION                                              */
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
  /* BASE ROLE PERMISSIONS                                           */
  /* -------------------------------------------------------------- */

  const rolePermissions: readonly Permission[] = role
    ? ROLE_PERMISSIONS[role]
    : [];

  /* -------------------------------------------------------------- */
  /* MERGE TRUSTED ASSIGNED PERMISSIONS                              */
  /* -------------------------------------------------------------- */

  /**
   * Role permissions are the default.
   *
   * Branch assignment and business membership permissions
   * extend the default permissions.
   *
   * Context filtering below prevents a permission from being
   * used outside its permitted context.
   */
  const assignedPermissions: readonly Permission[] = [
    ...new Set<Permission>([
      ...rolePermissions,
      ...grantedPermissions,
    ]),
  ];

  /* -------------------------------------------------------------- */
  /* CONTEXT PERMISSION FILTER                                       */
  /* -------------------------------------------------------------- */

  const contextPermissions = getContextPermissions(context);

  const effectivePermissions: readonly Permission[] =
    assignedPermissions.filter((permission) =>
      contextPermissions.includes(permission),
    );

  /* -------------------------------------------------------------- */
  /* READ-ONLY POLICY                                                */
  /* -------------------------------------------------------------- */

  /**
   * Branch inspection can never be mutated.
   *
   * readOnlyRoles is an additional route-level restriction.
   *
   * Do not use readOnlyRoles={["CEO"]} on routes where an owner
   * might be operating a branch they manage.
   */
  const isReadOnly =
    readOnly ||
    context.type === "BRANCH_INSPECTION" ||
    (!!role && readOnlyRoles.includes(role));

  /* -------------------------------------------------------------- */
  /* AUTHORIZATION FUNCTIONS                                        */
  /* -------------------------------------------------------------- */

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

  /* -------------------------------------------------------------- */
  /* ROUTE PERMISSION REQUIREMENTS                                   */
  /* -------------------------------------------------------------- */

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

  /* -------------------------------------------------------------- */
  /* ROUTE ACCESS                                                    */
  /* -------------------------------------------------------------- */

  const routeAccess: RouteAccess = {
    role,

    context,

    readOnly: isReadOnly,

    permissions: effectivePermissions,

    can,

    canMutate,
  };

  /* -------------------------------------------------------------- */
  /* RENDER                                                          */
  /* -------------------------------------------------------------- */

  return (
    <RouteAccessContext.Provider value={routeAccess}>
      {children ?? <Outlet />}
    </RouteAccessContext.Provider>
  );
}
