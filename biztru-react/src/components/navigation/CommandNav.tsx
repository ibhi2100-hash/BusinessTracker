
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  CreditCard,
  ShieldCheck,
  BrainCircuit,
  Headset,
  Fingerprint,
  Server,
  Users,
  Receipt,
  Package,
  Activity,
  ChartNoAxesCombined,
  MoreHorizontal,
  ChevronRight,
  X,
  FileText,
  ClipboardList,
  Database,
  Workflow,
  AlertTriangle,
  Gauge,
  Wallet,
  LockKeyhole,
  ArrowLeftRight,
  RefreshCw,
  ScrollText,
  Layers,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";
import { cn } from "../../lib/utils";

import {
  usePlatformSession,
} from "../../Biztru/services/PlatformSession/PlatformSessionContext";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type IconComponent = ComponentType<{
  className?: string;
}>;

type PlatformRole = string;

interface NavigationItem {
  label: string;
  icon: IconComponent;
  href: string;
  permission: string;
}

interface MoreItem extends NavigationItem {
  description: string;
}

interface MoreGroup {
  title: string;
  items: MoreItem[];
}

interface RoleNavigation {
  label: string;
  title: string;
  description: string;
  primary: NavigationItem[];
  more: MoreGroup[];
}

/* -------------------------------------------------------------------------- */
/* PERMISSION CODES                                                           */
/*                                                                            */
/* These must match the permission codes registered in your backend RBAC.    */
/* -------------------------------------------------------------------------- */

const PERMISSION = {
  /* Dashboard */

  DASHBOARD_READ: "platform.analytics.read",

  /* Tenant management */

  TENANTS_READ: "platform.tenants.read",

  /* Commercial management - legacy module */

  COMMERCIAL_READ: "platform.commercial.read",
  COMMERCIAL_PLANS_READ: "platform.commercial.plans.read",
  COMMERCIAL_SUBSCRIPTIONS_READ: "platform.commercial.subscriptions.read",
  COMMERCIAL_INVOICES_READ: "platform.commercial.invoices.read",
  COMMERCIAL_PAYMENTS_READ: "platform.commercial.payments.read",
  COMMERCIAL_EVENTS_READ: "platform.commercial.events.read",

  /* Billing management */

  BILLING_READ: "platform.billing.read",

  BILLING_PLANS_READ: "platform.billing.plans.read",
  BILLING_PLANS_CREATE: "platform.billing.plans.create",
  BILLING_PLANS_UPDATE: "platform.billing.plans.update",
  BILLING_PLANS_PUBLISH: "platform.billing.plans.publish",
  BILLING_PLANS_RETIRE: "platform.billing.plans.retire",

  BILLING_SUBSCRIPTIONS_READ: "platform.billing.subscriptions.read",
  BILLING_SUBSCRIPTIONS_MANAGE: "platform.billing.subscriptions.manage",

  BILLING_ENTITLEMENTS_READ: "platform.billing.entitlements.read",
  BILLING_ENTITLEMENTS_MANAGE: "platform.billing.entitlements.manage",

  BILLING_FINANCIAL_READ: "platform.billing.financial.read",
  BILLING_FINANCIAL_MANAGE: "platform.billing.financial.manage",

  BILLING_EVENTS_READ: "platform.billing.events.read",

  BILLING_SYNCHRONIZATION_READ:
    "platform.billing.synchronization.read",

  /* General platform entitlements */

  ENTITLEMENTS_READ: "platform.entitlements.read",

  /* Intelligence */

  INTELLIGENCE_READ: "platform.intelligence.read",
  INTELLIGENCE_BUSINESSES_READ: "platform.intelligence.businesses.read",
  INTELLIGENCE_GROWTH_READ: "platform.intelligence.growth.read",
  INTELLIGENCE_USAGE_READ: "platform.intelligence.usage.read",
  INTELLIGENCE_REPORTS_READ: "platform.intelligence.reports.read",

  /* Support */

  SUPPORT_READ: "platform.support.read",
  SUPPORT_TICKETS_READ: "platform.support.tickets.read",
  SUPPORT_ESCALATIONS_READ: "platform.support.escalations.read",
  SUPPORT_BUSINESSES_READ: "platform.support.businesses.read",
  SUPPORT_ACTIVITY_READ: "platform.support.activity.read",

  /* Governance */

  USERS_READ: "platform.users.read",
  ROLES_READ: "platform.roles.read",
  PERMISSIONS_READ: "platform.permissions.read",
  AUDIT_READ: "platform.audit.read",
  SECURITY_INCIDENTS_READ: "platform.security.incidents.read",

  /* Infrastructure */

  INFRASTRUCTURE_READ: "platform.infrastructure.read",
  INFRASTRUCTURE_SERVICES_READ: "platform.infrastructure.services.read",
  INFRASTRUCTURE_DATABASE_READ: "platform.infrastructure.database.read",
  INFRASTRUCTURE_WORKERS_READ: "platform.infrastructure.workers.read",
  INFRASTRUCTURE_SYNC_READ:
    "platform.infrastructure.synchronization.read",
  INFRASTRUCTURE_INCIDENTS_READ: "platform.infrastructure.incidents.read",
  INFRASTRUCTURE_PERFORMANCE_READ:
    "platform.infrastructure.performance.read",
} as const;

/* -------------------------------------------------------------------------- */
/* NAVIGATION ITEM HELPERS                                                    */
/* -------------------------------------------------------------------------- */

function nav(
  label: string,
  icon: IconComponent,
  href: string,
  permission: string,
): NavigationItem {
  return {
    label,
    icon,
    href,
    permission,
  };
}

function more(
  label: string,
  description: string,
  icon: IconComponent,
  href: string,
  permission: string,
): MoreItem {
  return {
    label,
    description,
    icon,
    href,
    permission,
  };
}

/* -------------------------------------------------------------------------- */
/* FOUNDER BILLING NAVIGATION                                                 */
/* -------------------------------------------------------------------------- */

const founderBillingMoreGroup: MoreGroup = {
  title: "Billing Management",
  items: [
    more(
      "Billing overview",
      "Platform billing performance and metrics",
      CreditCard,
      "/command/billing",
      PERMISSION.BILLING_READ,
    ),
    more(
      "Plans and pricing",
      "Create, configure and publish subscription plans",
      Package,
      "/command/billing/plans",
      PERMISSION.BILLING_PLANS_READ,
    ),
    more(
      "Create billing plan",
      "Configure a new subscription plan",
      Layers,
      "/command/billing/plans/create",
      PERMISSION.BILLING_PLANS_CREATE,
    ),
    more(
      "Subscriptions",
      "Manage business subscriptions",
      CreditCard,
      "/command/billing/subscriptions",
      PERMISSION.BILLING_SUBSCRIPTIONS_READ,
    ),
    more(
      "Billing entitlements",
      "Review subscription features and business limits",
      ShieldCheck,
      "/command/billing/entitlements",
      PERMISSION.BILLING_ENTITLEMENTS_READ,
    ),
    more(
      "Financial operations",
      "Invoices, payments and billing revenue",
      Wallet,
      "/command/billing/financial",
      PERMISSION.BILLING_FINANCIAL_READ,
    ),
    more(
      "Billing events",
      "Subscription and payment lifecycle events",
      Activity,
      "/command/billing/events",
      PERMISSION.BILLING_EVENTS_READ,
    ),
    more(
      "Business synchronization",
      "Monitor published billing catalogue delivery",
      RefreshCw,
      "/command/billing/synchronization",
      PERMISSION.BILLING_SYNCHRONIZATION_READ,
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* FOUNDER NAVIGATION                                                         */
/* -------------------------------------------------------------------------- */

const founderPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/dashboard",
    PERMISSION.DASHBOARD_READ,
  ),
  nav(
    "Businesses",
    Building2,
    "/command/tenants",
    PERMISSION.TENANTS_READ,
  ),
  nav(
    "Billing",
    CreditCard,
    "/command/billing",
    PERMISSION.BILLING_READ,
  ),
  nav(
    "Intelligence",
    BrainCircuit,
    "/command/intelligence",
    PERMISSION.INTELLIGENCE_READ,
  ),
];

const founderMoreGroups: MoreGroup[] = [
  {
    title: "Platform Management",
    items: [
      more(
        "Business registry",
        "All registered businesses and tenants",
        Building2,
        "/command/tenants",
        PERMISSION.TENANTS_READ,
      ),
      more(
        "Commercial management",
        "Platform commercial configuration",
        CreditCard,
        "/command/commercial",
        PERMISSION.COMMERCIAL_READ,
      ),
      more(
        "Platform entitlements",
        "General platform access and entitlement configuration",
        ShieldCheck,
        "/command/entitlements",
        PERMISSION.ENTITLEMENTS_READ,
      ),
    ],
  },

  founderBillingMoreGroup,

  {
    title: "Intelligence",
    items: [
      more(
        "Platform analytics",
        "Platform-wide performance and metrics",
        BrainCircuit,
        "/command/intelligence",
        PERMISSION.INTELLIGENCE_READ,
      ),
      more(
        "Business performance",
        "Tenant growth and usage",
        ChartNoAxesCombined,
        "/command/intelligence/businesses",
        PERMISSION.INTELLIGENCE_BUSINESSES_READ,
      ),
    ],
  },

  {
    title: "Customer Operations",
    items: [
      more(
        "Support centre",
        "Customer requests and escalations",
        Headset,
        "/command/support",
        PERMISSION.SUPPORT_READ,
      ),
    ],
  },

  {
    title: "Governance",
    items: [
      more(
        "Administrators",
        "Platform operators and identities",
        Users,
        "/command/governance/administrators",
        PERMISSION.USERS_READ,
      ),
      more(
        "Security and access",
        "Platform security and permissions",
        Fingerprint,
        "/command/governance/permissions",
        PERMISSION.PERMISSIONS_READ,
      ),
      more(
        "Audit trail",
        "Administrative activities",
        ClipboardList,
        "/command/governance/audit",
        PERMISSION.AUDIT_READ,
      ),
    ],
  },

  {
    title: "Infrastructure",
    items: [
      more(
        "Infrastructure overview",
        "Services and system health",
        Server,
        "/command/infrastructure",
        PERMISSION.INFRASTRUCTURE_READ,
      ),
      more(
        "Database monitoring",
        "Database health and capacity",
        Database,
        "/command/infrastructure/database",
        PERMISSION.INFRASTRUCTURE_DATABASE_READ,
      ),
      more(
        "System incidents",
        "Technical incidents and failures",
        AlertTriangle,
        "/command/infrastructure/incidents",
        PERMISSION.INFRASTRUCTURE_INCIDENTS_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* PLATFORM ADMINISTRATOR NAVIGATION                                          */
/* -------------------------------------------------------------------------- */

const adminPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/dashboard",
    PERMISSION.DASHBOARD_READ,
  ),
  nav(
    "Businesses",
    Building2,
    "/command/tenants",
    PERMISSION.TENANTS_READ,
  ),
  nav(
    "Entitlements",
    ShieldCheck,
    "/command/entitlements",
    PERMISSION.ENTITLEMENTS_READ,
  ),
  nav(
    "Support",
    Headset,
    "/command/support",
    PERMISSION.SUPPORT_READ,
  ),
];

const adminMoreGroups: MoreGroup[] = [
  {
    title: "Platform Operations",
    items: [
      more(
        "Business registry",
        "Inspect registered businesses",
        Building2,
        "/command/tenants",
        PERMISSION.TENANTS_READ,
      ),
      more(
        "Entitlements",
        "Manage general business access limits",
        ShieldCheck,
        "/command/entitlements",
        PERMISSION.ENTITLEMENTS_READ,
      ),
    ],
  },
  {
    title: "Customer Operations",
    items: [
      more(
        "Support centre",
        "Assist businesses",
        Headset,
        "/command/support",
        PERMISSION.SUPPORT_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* BILLING OPERATOR NAVIGATION                                                */
/* -------------------------------------------------------------------------- */

const billingPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/billing",
    PERMISSION.BILLING_READ,
  ),
  nav(
    "Plans",
    Package,
    "/command/billing/plans",
    PERMISSION.BILLING_PLANS_READ,
  ),
  nav(
    "Subscriptions",
    CreditCard,
    "/command/billing/subscriptions",
    PERMISSION.BILLING_SUBSCRIPTIONS_READ,
  ),
  nav(
    "Financials",
    Wallet,
    "/command/billing/financial",
    PERMISSION.BILLING_FINANCIAL_READ,
  ),
];

const billingMoreGroups: MoreGroup[] = [
  {
    title: "Plan Management",
    items: [
      more(
        "Plan catalogue",
        "View configured subscription plans",
        Package,
        "/command/billing/plans",
        PERMISSION.BILLING_PLANS_READ,
      ),
      more(
        "Create billing plan",
        "Create a new subscription plan",
        Layers,
        "/command/billing/plans/create",
        PERMISSION.BILLING_PLANS_CREATE,
      ),
    ],
  },

  {
    title: "Subscription Operations",
    items: [
      more(
        "Subscriptions",
        "Business subscription registry",
        CreditCard,
        "/command/billing/subscriptions",
        PERMISSION.BILLING_SUBSCRIPTIONS_READ,
      ),
      more(
        "Billing entitlements",
        "Subscription limits and enabled features",
        ShieldCheck,
        "/command/billing/entitlements",
        PERMISSION.BILLING_ENTITLEMENTS_READ,
      ),
    ],
  },

  {
    title: "Financial Operations",
    items: [
      more(
        "Invoices and payments",
        "Review billing documents and payment transactions",
        Receipt,
        "/command/billing/financial",
        PERMISSION.BILLING_FINANCIAL_READ,
      ),
    ],
  },

  {
    title: "Billing Monitoring",
    items: [
      more(
        "Billing events",
        "Billing lifecycle and transaction events",
        Activity,
        "/command/billing/events",
        PERMISSION.BILLING_EVENTS_READ,
      ),
      more(
        "Business synchronization",
        "Monitor catalogue revisions and acknowledgements",
        ArrowLeftRight,
        "/command/billing/synchronization",
        PERMISSION.BILLING_SYNCHRONIZATION_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* SUPPORT OPERATOR NAVIGATION                                                */
/* -------------------------------------------------------------------------- */

const supportPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/support",
    PERMISSION.SUPPORT_READ,
  ),
  nav(
    "Tickets",
    Headset,
    "/command/support/tickets",
    PERMISSION.SUPPORT_TICKETS_READ,
  ),
  nav(
    "Businesses",
    Building2,
    "/command/support/businesses",
    PERMISSION.SUPPORT_BUSINESSES_READ,
  ),
];

const supportMoreGroups: MoreGroup[] = [
  {
    title: "Customer Operations",
    items: [
      more(
        "All tickets",
        "Customer support requests",
        Headset,
        "/command/support/tickets",
        PERMISSION.SUPPORT_TICKETS_READ,
      ),
      more(
        "Escalations",
        "Tickets requiring special attention",
        AlertTriangle,
        "/command/support/escalations",
        PERMISSION.SUPPORT_ESCALATIONS_READ,
      ),
      more(
        "Business accounts",
        "Customer account lookup",
        Building2,
        "/command/support/businesses",
        PERMISSION.SUPPORT_BUSINESSES_READ,
      ),
      more(
        "Support activity",
        "Support resolution history",
        ClipboardList,
        "/command/support/activity",
        PERMISSION.SUPPORT_ACTIVITY_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* SECURITY ADMINISTRATOR NAVIGATION                                          */
/* -------------------------------------------------------------------------- */

const securityPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/governance",
    PERMISSION.DASHBOARD_READ,
  ),
  nav(
    "Identities",
    Users,
    "/command/governance/administrators",
    PERMISSION.USERS_READ,
  ),
  nav(
    "Audit",
    ClipboardList,
    "/command/governance/audit",
    PERMISSION.AUDIT_READ,
  ),
  nav(
    "Incidents",
    ShieldCheck,
    "/command/governance/incidents",
    PERMISSION.SECURITY_INCIDENTS_READ,
  ),
];

const securityMoreGroups: MoreGroup[] = [
  {
    title: "Identity Management",
    items: [
      more(
        "Administrators",
        "Platform administrative identities",
        Users,
        "/command/governance/administrators",
        PERMISSION.USERS_READ,
      ),
      more(
        "Roles and permissions",
        "Platform access control",
        LockKeyhole,
        "/command/governance/permissions",
        PERMISSION.PERMISSIONS_READ,
      ),
    ],
  },
  {
    title: "Security Monitoring",
    items: [
      more(
        "Audit trail",
        "Administrative action history",
        ClipboardList,
        "/command/governance/audit",
        PERMISSION.AUDIT_READ,
      ),
      more(
        "Security incidents",
        "Security events and investigations",
        ShieldCheck,
        "/command/governance/incidents",
        PERMISSION.SECURITY_INCIDENTS_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* PLATFORM ENGINEER NAVIGATION                                               */
/* -------------------------------------------------------------------------- */

const engineerPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/infrastructure",
    PERMISSION.INFRASTRUCTURE_READ,
  ),
  nav(
    "Services",
    Server,
    "/command/infrastructure/services",
    PERMISSION.INFRASTRUCTURE_SERVICES_READ,
  ),
  nav(
    "Database",
    Database,
    "/command/infrastructure/database",
    PERMISSION.INFRASTRUCTURE_DATABASE_READ,
  ),
  nav(
    "Incidents",
    AlertTriangle,
    "/command/infrastructure/incidents",
    PERMISSION.INFRASTRUCTURE_INCIDENTS_READ,
  ),
];

const engineerMoreGroups: MoreGroup[] = [
  {
    title: "Infrastructure",
    items: [
      more(
        "Services",
        "API and application services",
        Server,
        "/command/infrastructure/services",
        PERMISSION.INFRASTRUCTURE_SERVICES_READ,
      ),
      more(
        "Database",
        "Database performance and capacity",
        Database,
        "/command/infrastructure/database",
        PERMISSION.INFRASTRUCTURE_DATABASE_READ,
      ),
      more(
        "Background workers",
        "Queue and job processing",
        Workflow,
        "/command/infrastructure/workers",
        PERMISSION.INFRASTRUCTURE_WORKERS_READ,
      ),
      more(
        "Synchronization",
        "Synchronization engine monitoring",
        ArrowLeftRight,
        "/command/infrastructure/synchronization",
        PERMISSION.INFRASTRUCTURE_SYNC_READ,
      ),
    ],
  },
  {
    title: "Reliability",
    items: [
      more(
        "Incidents",
        "Infrastructure incidents",
        AlertTriangle,
        "/command/infrastructure/incidents",
        PERMISSION.INFRASTRUCTURE_INCIDENTS_READ,
      ),
      more(
        "Performance",
        "Latency and service health",
        Gauge,
        "/command/infrastructure/performance",
        PERMISSION.INFRASTRUCTURE_PERFORMANCE_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* PLATFORM ANALYST NAVIGATION                                                */
/* -------------------------------------------------------------------------- */

const analystPrimaryNav: NavigationItem[] = [
  nav(
    "Overview",
    LayoutDashboard,
    "/command/intelligence",
    PERMISSION.INTELLIGENCE_READ,
  ),
  nav(
    "Businesses",
    Building2,
    "/command/intelligence/businesses",
    PERMISSION.INTELLIGENCE_BUSINESSES_READ,
  ),
  nav(
    "Growth",
    ChartNoAxesCombined,
    "/command/intelligence/growth",
    PERMISSION.INTELLIGENCE_GROWTH_READ,
  ),
  nav(
    "Usage",
    Activity,
    "/command/intelligence/usage",
    PERMISSION.INTELLIGENCE_USAGE_READ,
  ),
];

const analystMoreGroups: MoreGroup[] = [
  {
    title: "Platform Intelligence",
    items: [
      more(
        "Business analytics",
        "Tenant performance and segmentation",
        Building2,
        "/command/intelligence/businesses",
        PERMISSION.INTELLIGENCE_BUSINESSES_READ,
      ),
      more(
        "Growth analytics",
        "Acquisition and retention",
        ChartNoAxesCombined,
        "/command/intelligence/growth",
        PERMISSION.INTELLIGENCE_GROWTH_READ,
      ),
      more(
        "Usage analytics",
        "Platform usage and activity",
        Activity,
        "/command/intelligence/usage",
        PERMISSION.INTELLIGENCE_USAGE_READ,
      ),
      more(
        "Reports",
        "Platform intelligence reports",
        FileText,
        "/command/intelligence/reports",
        PERMISSION.INTELLIGENCE_REPORTS_READ,
      ),
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* ROLE CONFIGURATION                                                         */
/* -------------------------------------------------------------------------- */

const roleNavigation: Partial<Record<PlatformRole, RoleNavigation>> = {
  FOUNDER: {
    label: "FOUNDER CONTROL",
    title: "Command Centre",
    description: "Platform administration",
    primary: founderPrimaryNav,
    more: founderMoreGroups,
  },

  PLATFORM_ADMIN: {
    label: "PLATFORM OPERATIONS",
    title: "Platform Admin",
    description: "Business and platform operations",
    primary: adminPrimaryNav,
    more: adminMoreGroups,
  },

  BILLING_OPERATOR: {
    label: "COMMERCIAL OPERATIONS",
    title: "Billing Workspace",
    description: "Plans, subscriptions and revenue",
    primary: billingPrimaryNav,
    more: billingMoreGroups,
  },

  SUPPORT_OPERATOR: {
    label: "CUSTOMER OPERATIONS",
    title: "Support Workspace",
    description: "Customer assistance and resolution",
    primary: supportPrimaryNav,
    more: supportMoreGroups,
  },

  SECURITY_ADMIN: {
    label: "PLATFORM GOVERNANCE",
    title: "Security Workspace",
    description: "Identity, access and accountability",
    primary: securityPrimaryNav,
    more: securityMoreGroups,
  },

  PLATFORM_ENGINEER: {
    label: "TECHNICAL OPERATIONS",
    title: "Engineering Workspace",
    description: "Infrastructure and reliability",
    primary: engineerPrimaryNav,
    more: engineerMoreGroups,
  },

  PLATFORM_ANALYST: {
    label: "PLATFORM INTELLIGENCE",
    title: "Analytics Workspace",
    description: "Platform metrics and business intelligence",
    primary: analystPrimaryNav,
    more: analystMoreGroups,
  },
};

/* -------------------------------------------------------------------------- */
/* NAVIGATION COMPOSITION                                                     */
/* -------------------------------------------------------------------------- */

const ROLE_PRIORITY: PlatformRole[] = [
  "FOUNDER",
  "PLATFORM_ADMIN",
  "SECURITY_ADMIN",
  "BILLING_OPERATOR",
  "SUPPORT_OPERATOR",
  "PLATFORM_ENGINEER",
  "PLATFORM_ANALYST",
];

function uniqueNavigationItems<T extends NavigationItem>(
  items: T[],
): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.href}:${item.label}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function composeMoreGroups(groups: MoreGroup[]): MoreGroup[] {
  const grouped = new Map<string, MoreItem[]>();

  for (const group of groups) {
    const existing = grouped.get(group.title) ?? [];

    grouped.set(
      group.title,
      uniqueNavigationItems([...existing, ...group.items]),
    );
  }

  return Array.from(grouped.entries())
    .map(([title, items]) => ({
      title,
      items,
    }))
    .filter((group) => group.items.length > 0);
}

function getRoleConfigurations(
  roleCodes: string[],
): RoleNavigation[] {
  return roleCodes
    .map((code) => roleNavigation[code])
    .filter(
      (config): config is RoleNavigation => config !== undefined,
    );
}

function getNavigationConfiguration(
  roleCodes: string[],
): RoleNavigation {
  const sortedRoles = [...roleCodes].sort((a, b) => {
    const aIndex = ROLE_PRIORITY.indexOf(a);
    const bIndex = ROLE_PRIORITY.indexOf(b);

    return (
      (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
    );
  });

  const configurations = getRoleConfigurations(sortedRoles);

  if (configurations.length === 0) {
    return {
      label: "PLATFORM ACCESS",
      title: "Platform Workspace",
      description: "Available platform operations",
      primary: [],
      more: [],
    };
  }

  const primary = uniqueNavigationItems(
    configurations.flatMap((config) => config.primary),
  );

  const moreGroups = composeMoreGroups(
    configurations.flatMap((config) => config.more),
  );

  return {
    label:
      configurations.length > 1
        ? "MULTI-ROLE ACCESS"
        : configurations[0].label,

    title:
      configurations.length > 1
        ? "Platform Workspace"
        : configurations[0].title,

    description:
      configurations.length > 1
        ? "Combined authorized workspaces"
        : configurations[0].description,

    primary,
    more: moreGroups,
  };
}

/* -------------------------------------------------------------------------- */
/* PERMISSION FILTERING                                                       */
/* -------------------------------------------------------------------------- */

function filterByPermissions<T extends NavigationItem>(
  items: T[],
  permissionSet: Set<string>,
): T[] {
  return items.filter((item) =>
    permissionSet.has(item.permission),
  );
}

function filterGroupsByPermissions(
  groups: MoreGroup[],
  permissionSet: Set<string>,
): MoreGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterByPermissions(group.items, permissionSet),
    }))
    .filter((group) => group.items.length > 0);
}

/* -------------------------------------------------------------------------- */
/* ROUTE MATCHING                                                             */
/* -------------------------------------------------------------------------- */

function isActive(
  pathname: string,
  href: string,
): boolean {
  if (href === "/command") {
    return pathname === "/command" ||
      pathname === "/command/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

/* -------------------------------------------------------------------------- */
/* NAVIGATION ROW                                                             */
/* -------------------------------------------------------------------------- */

function NavLinkRow({
  to,
  label,
  icon: Icon,
  active,
  compact = false,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: IconComponent;
  active: boolean;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm transition-all",
        compact ? "px-3 py-2" : "px-3 py-2.5",
        active
          ? "bg-teal-500/15 text-teal-300"
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          compact ? "h-4 w-4 opacity-80" : "h-5 w-5",
        )}
      />

      <span className="truncate">{label}</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* MOBILE MORE LINK                                                           */
/* -------------------------------------------------------------------------- */

function MobileMoreLink({
  item,
  Icon,
  active,
  onClick,
}: {
  item: MoreItem | NavigationItem;
  Icon: IconComponent;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all active:scale-[0.98]",
        active
          ? "border-teal-500/20 bg-teal-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
      )}
    >
      <GlassIcon size="sm" variant="primary">
        <Icon className="h-4 w-4" />
      </GlassIcon>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">
          {item.label}
        </p>

        {"description" in item && (
          <p className="truncate text-[11px] text-gray-500">
            {item.description}
          </p>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-gray-600" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMMAND NAVIGATION                                                    */
/* -------------------------------------------------------------------------- */

export default function CommandNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const {
    session,
    status,
    isAuthenticated,
    logout,
  } = usePlatformSession();

  const [moreOpen, setMoreOpen] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* SESSION DATA                                                            */
  /* ---------------------------------------------------------------------- */

  const roleCodes = useMemo(
    () => session.authorization.roles.map((role) => role.code),
    [session.authorization.roles],
  );

  const permissionSet = useMemo(
    () => new Set(session.authorization.permissions),
    [session.authorization.permissions],
  );

  /* ---------------------------------------------------------------------- */
  /* ROLE-BASED WORKSPACE                                                    */
  /* ---------------------------------------------------------------------- */

  const config = useMemo(
    () => getNavigationConfiguration(roleCodes),
    [roleCodes],
  );

  /* ---------------------------------------------------------------------- */
  /* PERMISSION-BASED NAVIGATION                                             */
  /* ---------------------------------------------------------------------- */

  const primaryNavigation = useMemo(
    () => filterByPermissions(config.primary, permissionSet),
    [config.primary, permissionSet],
  );

  const moreNavigation = useMemo(
    () => filterGroupsByPermissions(config.more, permissionSet),
    [config.more, permissionSet],
  );

  /* ---------------------------------------------------------------------- */
  /* OPERATOR IDENTITY                                                       */
  /* ---------------------------------------------------------------------- */

  const displayName =
    session.user?.name ?? "Platform Operator";

  const email =
    session.user?.email ?? "";

  const roleLabel = roleCodes.length
    ? roleCodes.map((role) => role.replaceAll("_", " ")).join(" · ")
    : "NO ASSIGNED ROLE";

  /* ---------------------------------------------------------------------- */
  /* CLOSE MOBILE NAVIGATION ON ROUTE CHANGES                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  /* ---------------------------------------------------------------------- */
  /* BODY SCROLL LOCK                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!moreOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [moreOpen]);

  /* ---------------------------------------------------------------------- */
  /* NAVIGATION HELPERS                                                      */
  /* ---------------------------------------------------------------------- */

  const closeMore = useCallback(() => {
    setMoreOpen(false);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      setMoreOpen(false);
      navigate(href);
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    setMoreOpen(false);
    await logout();
    navigate("/command/login", { replace: true });
  }, [logout, navigate]);

  /* ---------------------------------------------------------------------- */
  /* AUTHENTICATION STATE                                                    */
  /* ---------------------------------------------------------------------- */

  if (
    status !== "AUTHENTICATED" ||
    !isAuthenticated ||
    !session.user
  ) {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* ================================================================ */}
      {/* DESKTOP SIDEBAR                                                    */}
      {/* ================================================================ */}

      <aside
        className="
          fixed bottom-0 left-0 top-0 z-40
          hidden w-64 flex-col
          border-r border-white/10
          bg-neutral-950/90
          backdrop-blur-2xl
          lg:flex
        "
        aria-label="Command Centre navigation"
      >
        {/* Header */}

        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-400/80">
            {config.label}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {config.title}
          </h2>

          <p className="mt-1 text-[11px] text-gray-500">
            {config.description}
          </p>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {primaryNavigation.length > 0 && (
            <section>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                WORKSPACE
              </p>

              <div className="space-y-1">
                {primaryNavigation.map((item) => (
                  <NavLinkRow
                    key={`${item.href}:${item.label}`}
                    to={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(pathname, item.href)}
                  />
                ))}
              </div>
            </section>
          )}

          {moreNavigation.map((group) => (
            <section key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLinkRow
                    key={`${item.href}:${item.label}`}
                    to={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(pathname, item.href)}
                    compact
                  />
                ))}
              </div>
            </section>
          ))}

          {primaryNavigation.length === 0 &&
            moreNavigation.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-sm font-medium text-white">
                  No navigation access
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your account does not currently have permissions
                  for any command centre section.
                </p>
              </div>
            )}
        </nav>

        {/* Operator identity */}

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] p-3">
            <GlassIcon size="sm" variant="primary">
              <Fingerprint className="h-4 w-4" />
            </GlassIcon>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {displayName}
              </p>

              <p className="mt-1 truncate text-[10px] text-gray-500">
                {email}
              </p>

              <p className="mt-1 truncate text-[9px] uppercase tracking-wide text-teal-400/80">
                {roleLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="
              mt-3 w-full rounded-xl border border-white/10
              px-3 py-2 text-left text-xs text-gray-400
              transition hover:border-red-500/20
              hover:bg-red-500/10 hover:text-red-300
            "
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MOBILE BOTTOM NAVIGATION                                          */}
      {/* ================================================================ */}

      <div className="fixed bottom-4 left-3 right-3 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <GlassCard
          variant="elevated"
          className="border-white/15 px-1.5 py-1.5"
        >
          <nav
            className="flex items-center justify-between"
            aria-label="Primary navigation"
          >
            {primaryNavigation.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={`${item.href}:${item.label}`}
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className="
                    flex flex-1 flex-col
                    items-center justify-center
                    gap-0.5 rounded-2xl py-1.5
                    transition-all active:scale-95
                  "
                >
                  <div
                    className={cn(
                      "rounded-xl p-2 transition-colors",
                      active
                        ? "bg-teal-500/15 text-teal-400"
                        : "text-gray-400",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      active ? "text-teal-400" : "text-gray-500",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {(moreNavigation.length > 0 ||
              primaryNavigation.length > 4) && (
              <button
                type="button"
                aria-label="Open more navigation"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen(true)}
                className="
                  flex flex-1 flex-col
                  items-center justify-center
                  gap-0.5 rounded-2xl py-1.5
                  transition-all active:scale-95
                "
              >
                <div
                  className={cn(
                    "rounded-xl p-2 transition-colors",
                    moreOpen
                      ? "bg-teal-500/15 text-teal-400"
                      : "text-gray-400",
                  )}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </div>

                <span
                  className={cn(
                    "text-[10px] font-medium",
                    moreOpen ? "text-teal-400" : "text-gray-500",
                  )}
                >
                  More
                </span>
              </button>
            )}
          </nav>
        </GlassCard>
      </div>

      {/* ================================================================ */}
      {/* MOBILE MORE SHEET                                                  */}
      {/* ================================================================ */}

      {moreOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
        >
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
            onClick={closeMore}
          />

          {/* Sheet */}

          <div
            className="
              relative flex max-h-[85dvh] w-full
              flex-col rounded-t-[28px]
              border border-b-0 border-white/10
              bg-neutral-950/95
              shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
              backdrop-blur-2xl
            "
          >
            {/* Handle */}

            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>

            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  More
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {config.description}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={closeMore}
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-xl
                  bg-white/5 transition
                  hover:bg-white/10
                "
              >
                <X className="h-4 w-4 text-gray-300" />
              </button>
            </div>

            {/* Content */}

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {primaryNavigation.length > 4 && (
                <section>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    WORKSPACE
                  </p>

                  <div className="space-y-1.5">
                    {primaryNavigation.slice(4).map((item) => (
                      <MobileMoreLink
                        key={`${item.href}:${item.label}`}
                        item={item}
                        Icon={item.icon}
                        active={isActive(pathname, item.href)}
                        onClick={() => navigateTo(item.href)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {moreNavigation.map((group) => (
                <section key={group.title}>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {group.title}
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <MobileMoreLink
                        key={`${item.href}:${item.label}`}
                        item={item}
                        Icon={item.icon}
                        active={isActive(pathname, item.href)}
                        onClick={() => navigateTo(item.href)}
                      />
                    ))}
                  </div>
                </section>
              ))}

              <section className="border-t border-white/10 pt-4">
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.035] p-3">
                  <GlassIcon size="sm" variant="primary">
                    <Fingerprint className="h-4 w-4" />
                  </GlassIcon>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">
                      {displayName}
                    </p>

                    <p className="truncate text-[10px] text-gray-500">
                      {email}
                    </p>

                    <p className="mt-1 truncate text-[9px] uppercase tracking-wide text-teal-400/80">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="
                    w-full rounded-xl border border-white/10
                    px-3 py-3 text-left text-sm text-gray-400
                    transition hover:border-red-500/20
                    hover:bg-red-500/10 hover:text-red-300
                  "
                >
                  Sign out
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
