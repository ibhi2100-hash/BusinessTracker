
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Activity,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { usePlatformSession } from "../../Biztru/services/PlatformSession/PlatformSessionContext";
import { cn } from "../../lib/utils";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type PlatformRole =
  | "FOUNDER"
  | "PLATFORM_ADMIN"
  | "BILLING_OPERATOR"
  | "SUPPORT_OPERATOR"
  | "SECURITY_ADMIN"
  | "PLATFORM_ENGINEER"
  | "PLATFORM_ANALYST";

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission: string;
  match?: "exact" | "subtree";
}

interface NavigationGroup {
  label: string;
  icon: LucideIcon;
  items: NavigationItem[];
}

interface RoleNavigation {
  primary: NavigationItem[];
  groups: NavigationGroup[];
}

interface BackendRole {
  id: string;
  code: string;
  name: string;
}

interface BackendPlatformSession {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  } | null;

  authorization?: {
    roles: BackendRole[];
    permissions: string[];
  };
}

/* -------------------------------------------------------------------------- */
/* BACKEND PERMISSIONS                                                        */
/* -------------------------------------------------------------------------- */

const PERMISSION = {
  DASHBOARD: "platform.analytics.read",

  TENANTS_READ: "platform.tenants.read",

  COMMERCIAL_READ: "platform.commercial.read",

  ENTITLEMENTS_READ: "platform.entitlements.read",

  BILLING_READ: "platform.billing.read",

  BILLING_PLANS_READ: "platform.billing.plans.read",
  BILLING_PLANS_CREATE: "platform.billing.plans.create",
  BILLING_PLANS_UPDATE: "platform.billing.plans.update",
  BILLING_PLANS_PUBLISH: "platform.billing.plans.publish",
  BILLING_PLANS_RETIRE: "platform.billing.plans.retire",

  BILLING_SUBSCRIPTIONS_READ:
    "platform.billing.subscriptions.read",

  BILLING_ENTITLEMENTS_READ:
    "platform.billing.entitlements.read",

  BILLING_EVENTS_READ:
    "platform.billing.events.read",

} as const;

/* -------------------------------------------------------------------------- */
/* NAVIGATION FACTORY                                                         */
/* -------------------------------------------------------------------------- */

const item = (
  label: string,
  path: string,
  icon: LucideIcon,
  permission: string,
  match: "exact" | "subtree" = "exact",
): NavigationItem => ({
  label,
  path,
  icon,
  permission,
  match,
});

/* -------------------------------------------------------------------------- */
/* SHARED NAVIGATION ITEMS                                                    */
/* -------------------------------------------------------------------------- */

const dashboardItem = item(
  "Overview",
  "/command/dashboard",
  LayoutDashboard,
  PERMISSION.DASHBOARD,
);

const tenantsItem = item(
  "Businesses",
  "/command/tenants",
  Building2,
  PERMISSION.TENANTS_READ,
);

const commercialItem = item(
  "Commercial Management",
  "/command/commercial",
  CircleDollarSign,
  PERMISSION.COMMERCIAL_READ,
);

const entitlementsItem = item(
  "Platform Entitlements",
  "/command/entitlements",
  ShieldCheck,
  PERMISSION.ENTITLEMENTS_READ,
);

const billingItem = item(
  "Billing Overview",
  "/command/billing",
  CreditCard,
  PERMISSION.BILLING_READ,
);

/* -------------------------------------------------------------------------- */
/* BILLING PLAN NAVIGATION                                                    */
/* -------------------------------------------------------------------------- */

const plansItem = item(
  "Plans Catalogue",
  "/command/billing/plans",
  Package,
  PERMISSION.BILLING_PLANS_READ,
  "subtree",
);

const createPlanItem = item(
  "Create New Plan",
  "/command/billing/plans/create",
  Plus,
  PERMISSION.BILLING_PLANS_CREATE,
);

const subscriptionsItem = item(
  "Subscriptions",
  "/command/billing/subscriptions",
  Receipt,
  PERMISSION.BILLING_SUBSCRIPTIONS_READ,
  "subtree",
);

const billingEntitlementsItem = item(
  "Billing Entitlements",
  "/command/billing/entitlements",
  ShieldCheck,
  PERMISSION.BILLING_ENTITLEMENTS_READ,
);

const billingEventsItem = item(
  "Billing Events",
  "/command/billing/events",
  Activity,
  PERMISSION.BILLING_EVENTS_READ,
);

/* -------------------------------------------------------------------------- */
/* BILLING MANAGEMENT GROUP                                                   */
/* -------------------------------------------------------------------------- */

const billingManagementGroup: NavigationGroup = {
  label: "Billing & Monetization",
  icon: CreditCard,

  items: [
    billingItem,
    plansItem,
    createPlanItem,
    subscriptionsItem,
    billingEntitlementsItem,
    billingEventsItem,
  ],
};

/* -------------------------------------------------------------------------- */
/* FOUNDER NAVIGATION                                                         */
/* -------------------------------------------------------------------------- */

const founderNavigation: RoleNavigation = {
  primary: [
    dashboardItem,
    tenantsItem,
    billingItem,
    commercialItem,
  ],

  groups: [
    {
      label: "Business Management",
      icon: Building2,
      items: [
        tenantsItem,
        commercialItem,
        entitlementsItem,
      ],
    },

    billingManagementGroup,
  ],
};

/* -------------------------------------------------------------------------- */
/* PLATFORM ADMIN NAVIGATION                                                  */
/* -------------------------------------------------------------------------- */

const platformAdminNavigation: RoleNavigation = {
  primary: [
    dashboardItem,
    tenantsItem,
    commercialItem,
  ],

  groups: [
    {
      label: "Platform Management",
      icon: Settings,
      items: [
        tenantsItem,
        commercialItem,
        entitlementsItem,
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* BILLING OPERATOR NAVIGATION                                                */
/* -------------------------------------------------------------------------- */

const billingOperatorNavigation: RoleNavigation = {
  primary: [
    billingItem,
    plansItem,
    subscriptionsItem,
  ],

  groups: [
    billingManagementGroup,
  ],
};

/* -------------------------------------------------------------------------- */
/* SUPPORT OPERATOR NAVIGATION                                                */
/* -------------------------------------------------------------------------- */

const supportOperatorNavigation: RoleNavigation = {
  primary: [
    tenantsItem,
  ],

  groups: [
    {
      label: "Business Support",
      icon: Users,
      items: [
        tenantsItem,
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* SECURITY ADMIN NAVIGATION                                                  */
/* -------------------------------------------------------------------------- */

const securityAdminNavigation: RoleNavigation = {
  primary: [
    dashboardItem,
  ],

  groups: [],
};

/* -------------------------------------------------------------------------- */
/* PLATFORM ENGINEER NAVIGATION                                               */
/* -------------------------------------------------------------------------- */

const platformEngineerNavigation: RoleNavigation = {
  primary: [
    dashboardItem,
  ],

  groups: [],
};

/* -------------------------------------------------------------------------- */
/* PLATFORM ANALYST NAVIGATION                                                */
/* -------------------------------------------------------------------------- */

const platformAnalystNavigation: RoleNavigation = {
  primary: [
    dashboardItem,
  ],

  groups: [],
};

/* -------------------------------------------------------------------------- */
/* ROLE REGISTRY                                                              */
/* -------------------------------------------------------------------------- */

const ROLE_NAVIGATION: Record<PlatformRole, RoleNavigation> = {
  FOUNDER: founderNavigation,
  PLATFORM_ADMIN: platformAdminNavigation,
  BILLING_OPERATOR: billingOperatorNavigation,
  SUPPORT_OPERATOR: supportOperatorNavigation,
  SECURITY_ADMIN: securityAdminNavigation,
  PLATFORM_ENGINEER: platformEngineerNavigation,
  PLATFORM_ANALYST: platformAnalystNavigation,
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function isPlatformRole(
  role: string,
): role is PlatformRole {
  return Object.prototype.hasOwnProperty.call(
    ROLE_NAVIGATION,
    role,
  );
}

function filterByPermissions(
  items: NavigationItem[],
  permissions: Set<string>,
): NavigationItem[] {
  return items.filter((entry) =>
    permissions.has(entry.permission),
  );
}

function isRouteActive(
  pathname: string,
  entry: NavigationItem,
): boolean {
  if (pathname === entry.path) {
    return true;
  }

  if (entry.match !== "subtree") {
    return false;
  }

  if (!pathname.startsWith(`${entry.path}/`)) {
    return false;
  }

  // The create route has its own navigation item.
  if (
    entry.path === "/command/billing/plans" &&
    pathname === "/command/billing/plans/create"
  ) {
    return false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* NAVIGATION BUILDER                                                         */
/* -------------------------------------------------------------------------- */

function buildNavigation(
  roles: BackendRole[],
  permissions: Set<string>,
): RoleNavigation {
  const primaryMap = new Map<string, NavigationItem>();
  const groupsMap = new Map<string, NavigationGroup>();

  for (const role of roles) {
    if (!isPlatformRole(role.code)) {
      continue;
    }

    const configuration = ROLE_NAVIGATION[role.code];

    for (const entry of configuration.primary) {
      primaryMap.set(entry.path, entry);
    }

    for (const group of configuration.groups) {
      const existing = groupsMap.get(group.label);

      if (!existing) {
        groupsMap.set(group.label, {
          ...group,
          items: [...group.items],
        });

        continue;
      }

      const existingPaths = new Set(
        existing.items.map((entry) => entry.path),
      );

      for (const entry of group.items) {
        if (!existingPaths.has(entry.path)) {
          existing.items.push(entry);
          existingPaths.add(entry.path);
        }
      }
    }
  }

  const primary = filterByPermissions(
    Array.from(primaryMap.values()),
    permissions,
  );

  const groups = Array.from(groupsMap.values())
    .map((group) => ({
      ...group,
      items: filterByPermissions(
        group.items,
        permissions,
      ),
    }))
    .filter((group) => group.items.length > 0);

  return {
    primary,
    groups,
  };
}

/* -------------------------------------------------------------------------- */
/* COMMAND NAVIGATION                                                         */
/* -------------------------------------------------------------------------- */

export default function CommandNav() {
  const location = useLocation();

  const { session } = usePlatformSession();

  const [moreOpen, setMoreOpen] = useState(false);

  const backendSession =
    session as unknown as BackendPlatformSession | null;

  const roles =
    backendSession?.authorization?.roles ?? [];

  const backendPermissions =
    backendSession?.authorization?.permissions ?? [];

  const permissionSet = useMemo(
    () => new Set(backendPermissions),
    [backendPermissions],
  );

  const navigation = useMemo(
    () => buildNavigation(roles, permissionSet),
    [roles, permissionSet],
  );

  const displayName =
    backendSession?.user?.name ?? "Platform User";

  const mobilePrimary = navigation.primary.slice(0, 4);

  const mobileMoreGroups = navigation.groups;

  const activeMoreGroup = navigation.groups.find(
    (group) =>
      group.items.some((entry) =>
        isRouteActive(location.pathname, entry),
      ),
  );

  /* ------------------------------------------------------------------------ */
  /* NAVIGATION LINK                                                          */
  /* ------------------------------------------------------------------------ */

  const renderNavigationItem = (
    entry: NavigationItem,
    mobile = false,
  ) => {
    const Icon = entry.icon;

    const active = isRouteActive(
      location.pathname,
      entry,
    );

    return (
      <Link
        key={entry.path}
        to={entry.path}
        onClick={() => setMoreOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl transition-all",

          mobile
            ? "border px-3 py-3 text-xs"
            : "px-3 py-2.5 text-sm",

          active
            ? mobile
              ? "border-teal-300/20 bg-teal-400/10 text-teal-200"
              : "bg-teal-400/10 font-semibold text-teal-200"
            : mobile
              ? "border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/[0.07]"
              : "text-white/55 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon size={mobile ? 16 : 17} />

        <span className="min-w-0 truncate">
          {entry.label}
        </span>

        {active && (
          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
        )}
      </Link>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* GROUP RENDERER                                                           */
  /* ------------------------------------------------------------------------ */

  const renderDesktopGroup = (
    group: NavigationGroup,
  ) => {
    const GroupIcon = group.icon;

    const active = group.items.some((entry) =>
      isRouteActive(location.pathname, entry),
    );

    return (
      <div key={group.label} className="pt-5">
        <div
          className={cn(
            "mb-2 flex items-center gap-2 px-3",
            "text-[10px] font-semibold uppercase tracking-[0.16em]",
            active ? "text-teal-300" : "text-white/30",
          )}
        >
          <GroupIcon size={13} />
          {group.label}
        </div>

        <div className="space-y-1">
          {group.items.map((entry) =>
            renderNavigationItem(entry),
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ================================================================== */}
      {/* DESKTOP SIDEBAR                                                     */}
      {/* ================================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#07131b]/95 backdrop-blur-xl lg:flex">

        {/* BRAND */}

        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
            <Zap size={21} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              BizTru
            </p>

            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Command Centre
            </p>
          </div>
        </div>

        {/* AUTHENTICATED USER */}

        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-400/10 text-sm font-semibold text-teal-300">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>

              <p className="truncate text-xs text-white/40">
                {roles.map((role) => role.name).join(", ") ||
                  "No assigned role"}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION */}

        <nav
          aria-label="Platform navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
        >
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Main Menu
          </p>

          {navigation.primary.map((entry) =>
            renderNavigationItem(entry),
          )}

          {navigation.groups.map(renderDesktopGroup)}

          {navigation.primary.length === 0 &&
            navigation.groups.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-white/40">
                No navigation permissions assigned.
              </p>
            )}
        </nav>

        {/* AUTHORIZATION STATUS */}

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-white/35">
            <CheckCircle2
              size={14}
              className="text-teal-400"
            />

            Backend authorization active
          </div>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION                                            */}
      {/* ================================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#07131b]/95 backdrop-blur-xl lg:hidden">

        <nav
          aria-label="Mobile platform navigation"
          className="grid grid-cols-5 gap-1 px-2 py-2"
        >
          {mobilePrimary.map((entry) => {
            const Icon = entry.icon;

            const active = isRouteActive(
              location.pathname,
              entry,
            );

            return (
              <Link
                key={entry.path}
                to={entry.path}
                onClick={() => setMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px]",
                  active
                    ? "bg-teal-400/10 text-teal-200"
                    : "text-white/45 hover:text-white",
                )}
              >
                <Icon size={19} />

                <span className="max-w-full truncate">
                  {entry.label}
                </span>
              </Link>
            );
          })}

          {/* MORE */}

          <button
            type="button"
            aria-expanded={moreOpen}
            aria-label="Toggle more navigation"
            onClick={() =>
              setMoreOpen((current) => !current)
            }
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px]",
              moreOpen || activeMoreGroup
                ? "bg-teal-400/10 text-teal-200"
                : "text-white/45 hover:text-white",
            )}
          >
            {moreOpen ? (
              <ChevronDown size={19} />
            ) : (
              <Settings size={19} />
            )}

            <span>More</span>
          </button>
        </nav>
      </div>

      {/* ================================================================== */}
      {/* MOBILE MORE MENU                                                    */}
      {/* ================================================================== */}

      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />

          <div className="fixed inset-x-0 bottom-[76px] z-40 max-h-[65vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0a1922] p-4 shadow-2xl lg:hidden">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Command Navigation
                </p>

                <p className="text-xs text-white/40">
                  Available sections based on your permissions
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {mobileMoreGroups.map((group) => {
              const GroupIcon = group.icon;

              return (
                <div
                  key={group.label}
                  className="mb-5"
                >
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-teal-300/70">
                    <GroupIcon size={14} />
                    {group.label}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((entry) =>
                      renderNavigationItem(entry, true),
                    )}
                  </div>
                </div>
              );
            })}

            {mobileMoreGroups.length === 0 && (
              <p className="py-8 text-center text-xs text-white/40">
                No additional sections are available.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
