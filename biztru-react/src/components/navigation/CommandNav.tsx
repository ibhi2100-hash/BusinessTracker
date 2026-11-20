
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
  Settings,
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
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";
import { cn } from "../../lib/utils";


/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type IconComponent = ComponentType<{
  className?: string;
}>;

export type PlatformRole =
  | "FOUNDER"
  | "PLATFORM_ADMIN"
  | "BILLING_OPERATOR"
  | "SUPPORT_OPERATOR"
  | "SECURITY_ADMIN"
  | "PLATFORM_ENGINEER"
  | "PLATFORM_ANALYST";

interface NavigationItem {
  label: string;
  icon: IconComponent;
  href: string;
}

interface MoreItem extends NavigationItem {
  description: string;
}

interface MoreGroup {
  title: string;
  items: MoreItem[];
}

interface CommandNavProps {
  role: PlatformRole;
  displayName?: string;
}

/* ------------------------------------------------------------------ */
/* Founder navigation                                                 */
/* ------------------------------------------------------------------ */

const founderPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command",
  },
  {
    label: "Businesses",
    icon: Building2,
    href: "/command/tenants",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/command/commercial",
  },
  {
    label: "Intelligence",
    icon: BrainCircuit,
    href: "/command/intelligence",
  },
];

const founderMoreGroups: MoreGroup[] = [
  {
    title: "Platform Management",
    items: [
      {
        label: "Business registry",
        description: "All registered businesses and tenants",
        icon: Building2,
        href: "/command/tenants",
      },
      {
        label: "Subscriptions and billing",
        description: "Plans, subscriptions and payments",
        icon: CreditCard,
        href: "/command/commercial",
      },
      {
        label: "Entitlements",
        description: "Plans, limits and business access",
        icon: ShieldCheck,
        href: "/command/entitlements",
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "Platform analytics",
        description: "Platform-wide performance and metrics",
        icon: BrainCircuit,
        href: "/command/intelligence",
      },
      {
        label: "Business performance",
        description: "Tenant growth and usage",
        icon: ChartNoAxesCombined,
        href: "/command/intelligence",
      },
    ],
  },
  {
    title: "Customer Operations",
    items: [
      {
        label: "Support centre",
        description: "Customer requests and escalations",
        icon: Headset,
        href: "/command/support",
      },
    ],
  },
  {
    title: "Governance",
    items: [
      {
        label: "Administrators",
        description: "Platform operators and identities",
        icon: Users,
        href: "/command/governance",
      },
      {
        label: "Security and access",
        description: "Platform security and permissions",
        icon: Fingerprint,
        href: "/command/governance",
      },
      {
        label: "Audit trail",
        description: "Administrative activities",
        icon: ClipboardList,
        href: "/command/governance",
      },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      {
        label: "Infrastructure overview",
        description: "Services and system health",
        icon: Server,
        href: "/command/infrastructure",
      },
      {
        label: "Database monitoring",
        description: "Database health and capacity",
        icon: Database,
        href: "/command/infrastructure",
      },
      {
        label: "System incidents",
        description: "Technical incidents and failures",
        icon: AlertTriangle,
        href: "/command/infrastructure",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Platform administrator navigation                                  */
/* ------------------------------------------------------------------ */

const adminPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command",
  },
  {
    label: "Businesses",
    icon: Building2,
    href: "/command/tenants",
  },
  {
    label: "Entitlements",
    icon: ShieldCheck,
    href: "/command/entitlements",
  },
  {
    label: "Support",
    icon: Headset,
    href: "/command/support",
  },
];

const adminMoreGroups: MoreGroup[] = [
  {
    title: "Platform Operations",
    items: [
      {
        label: "Business registry",
        description: "Inspect registered businesses",
        icon: Building2,
        href: "/command/tenants",
      },
      {
        label: "Entitlements",
        description: "Manage business access limits",
        icon: ShieldCheck,
        href: "/command/entitlements",
      },
    ],
  },
  {
    title: "Customer Operations",
    items: [
      {
        label: "Support centre",
        description: "Assist businesses",
        icon: Headset,
        href: "/command/support",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Billing operator navigation                                        */
/* ------------------------------------------------------------------ */

const billingPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command/commercial",
  },
  {
    label: "Subscriptions",
    icon: CreditCard,
    href: "/command/commercial/subscriptions",
  },
  {
    label: "Invoices",
    icon: Receipt,
    href: "/command/commercial/invoices",
  },
  {
    label: "Payments",
    icon: Wallet,
    href: "/command/commercial/payments",
  },
];

const billingMoreGroups: MoreGroup[] = [
  {
    title: "Commercial Operations",
    items: [
      {
        label: "Plans and pricing",
        description: "Manage platform subscription plans",
        icon: Package,
        href: "/command/commercial/plans",
      },
      {
        label: "Subscriptions",
        description: "Business subscription registry",
        icon: CreditCard,
        href: "/command/commercial/subscriptions",
      },
      {
        label: "Invoices",
        description: "Review billing documents",
        icon: FileText,
        href: "/command/commercial/invoices",
      },
      {
        label: "Payments",
        description: "Payment transactions",
        icon: Wallet,
        href: "/command/commercial/payments",
      },
      {
        label: "Billing events",
        description: "Billing lifecycle events",
        icon: Activity,
        href: "/command/commercial/events",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Support operator navigation                                        */
/* ------------------------------------------------------------------ */

const supportPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command/support",
  },
  {
    label: "Tickets",
    icon: Headset,
    href: "/command/support/tickets",
  },
  {
    label: "Businesses",
    icon: Building2,
    href: "/command/support/businesses",
  },
];

const supportMoreGroups: MoreGroup[] = [
  {
    title: "Customer Operations",
    items: [
      {
        label: "All tickets",
        description: "Customer support requests",
        icon: Headset,
        href: "/command/support/tickets",
      },
      {
        label: "Escalations",
        description: "Tickets requiring special attention",
        icon: AlertTriangle,
        href: "/command/support/escalations",
      },
      {
        label: "Business accounts",
        description: "Customer account lookup",
        icon: Building2,
        href: "/command/support/businesses",
      },
      {
        label: "Support activity",
        description: "Support resolution history",
        icon: ClipboardList,
        href: "/command/support/activity",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Security administrator navigation                                  */
/* ------------------------------------------------------------------ */

const securityPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command/governance",
  },
  {
    label: "Identities",
    icon: Users,
    href: "/command/governance/administrators",
  },
  {
    label: "Audit",
    icon: ClipboardList,
    href: "/command/governance/audit",
  },
  {
    label: "Incidents",
    icon: ShieldCheck,
    href: "/command/governance/incidents",
  },
];

const securityMoreGroups: MoreGroup[] = [
  {
    title: "Identity Management",
    items: [
      {
        label: "Administrators",
        description: "Platform administrative identities",
        icon: Users,
        href: "/command/governance/administrators",
      },
      {
        label: "Roles and permissions",
        description: "Platform access control",
        icon: LockKeyhole,
        href: "/command/governance/permissions",
      },
    ],
  },
  {
    title: "Security Monitoring",
    items: [
      {
        label: "Audit trail",
        description: "Administrative action history",
        icon: ClipboardList,
        href: "/command/governance/audit",
      },
      {
        label: "Security incidents",
        description: "Security events and investigations",
        icon: ShieldCheck,
        href: "/command/governance/incidents",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Platform engineer navigation                                       */
/* ------------------------------------------------------------------ */

const engineerPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command/infrastructure",
  },
  {
    label: "Services",
    icon: Server,
    href: "/command/infrastructure/services",
  },
  {
    label: "Database",
    icon: Database,
    href: "/command/infrastructure/database",
  },
  {
    label: "Incidents",
    icon: AlertTriangle,
    href: "/command/infrastructure/incidents",
  },
];

const engineerMoreGroups: MoreGroup[] = [
  {
    title: "Infrastructure",
    items: [
      {
        label: "Services",
        description: "API and application services",
        icon: Server,
        href: "/command/infrastructure/services",
      },
      {
        label: "Database",
        description: "Database performance and capacity",
        icon: Database,
        href: "/command/infrastructure/database",
      },
      {
        label: "Background workers",
        description: "Queue and job processing",
        icon: Workflow,
        href: "/command/infrastructure/workers",
      },
      {
        label: "Synchronization",
        description: "Synchronization engine monitoring",
        icon: ArrowLeftRight,
        href: "/command/infrastructure/synchronization",
      },
    ],
  },
  {
    title: "Reliability",
    items: [
      {
        label: "Incidents",
        description: "Infrastructure incidents",
        icon: AlertTriangle,
        href: "/command/infrastructure/incidents",
      },
      {
        label: "Performance",
        description: "Latency and service health",
        icon: Gauge,
        href: "/command/infrastructure/performance",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Platform analyst navigation                                       */
/* ------------------------------------------------------------------ */

const analystPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/command/intelligence",
  },
  {
    label: "Businesses",
    icon: Building2,
    href: "/command/intelligence/businesses",
  },
  {
    label: "Growth",
    icon: ChartNoAxesCombined,
    href: "/command/intelligence/growth",
  },
  {
    label: "Usage",
    icon: Activity,
    href: "/command/intelligence/usage",
  },
];

const analystMoreGroups: MoreGroup[] = [
  {
    title: "Platform Intelligence",
    items: [
      {
        label: "Business analytics",
        description: "Tenant performance and segmentation",
        icon: Building2,
        href: "/command/intelligence/businesses",
      },
      {
        label: "Growth analytics",
        description: "Acquisition and retention",
        icon: ChartNoAxesCombined,
        href: "/command/intelligence/growth",
      },
      {
        label: "Usage analytics",
        description: "Platform usage and activity",
        icon: Activity,
        href: "/command/intelligence/usage",
      },
      {
        label: "Reports",
        description: "Platform intelligence reports",
        icon: FileText,
        href: "/command/intelligence/reports",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Role configuration                                                 */
/* ------------------------------------------------------------------ */

interface RoleNavigation {
  label: string;
  title: string;
  description: string;
  primary: NavigationItem[];
  more: MoreGroup[];
}

const roleNavigation: Record<PlatformRole, RoleNavigation> = {
  FOUNDER: {
    label: "FOUNDER CONTROL",
    title: "Command Centre",
    description: "Complete platform administration",
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

/* ------------------------------------------------------------------ */
/* Route matching                                                     */
/* ------------------------------------------------------------------ */

function isActive(
  pathname: string,
  href: string,
): boolean {
  const exactMatchRoutes = [
    "/command",
    "/command/commercial",
    "/command/support",
    "/command/governance",
    "/command/infrastructure",
    "/command/intelligence",
  ];

  if (exactMatchRoutes.includes(href)) {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

/* ------------------------------------------------------------------ */
/* Navigation row                                                     */
/* ------------------------------------------------------------------ */

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

      <span className="truncate">
        {label}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main navigation                                                     */
/* ------------------------------------------------------------------ */

export default function CommandNav({
  role,
  displayName = "Platform Operator",
}: CommandNavProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const config = useMemo(
    () => roleNavigation[role],
    [role],
  );

  const [moreOpen, setMoreOpen] = useState(false);

  /* -------------------------------------------------------------- */
  /* Close mobile navigation on route changes                       */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  /* -------------------------------------------------------------- */
  /* Body scroll lock                                                */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (!moreOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [moreOpen]);

  /* -------------------------------------------------------------- */
  /* Navigation helpers                                              */
  /* -------------------------------------------------------------- */

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

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */

  return (
    <>
      {/* ========================================================== */}
      {/* Desktop sidebar                                            */}
      {/* ========================================================== */}

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

        {/* Primary and grouped navigation */}

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <section>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              WORKSPACE
            </p>

            <div className="space-y-1">
              {config.primary.map((item) => (
                <NavLinkRow
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(pathname, item.href)}
                />
              ))}
            </div>
          </section>

          {config.more.map((group) => (
            <section key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLinkRow
                    key={item.href + item.label}
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

              <p className="mt-1 text-[10px] text-gray-500">
                {role.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================== */}
      {/* Mobile bottom navigation                                   */}
      {/* ========================================================== */}

      <div className="fixed bottom-4 left-3 right-3 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <GlassCard
          variant="elevated"
          className="border-white/15 px-1.5 py-1.5"
        >
          <nav
            className="flex items-center justify-between"
            aria-label="Primary navigation"
          >
            {config.primary.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
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
          </nav>
        </GlassCard>
      </div>

      {/* ========================================================== */}
      {/* Mobile More sheet                                          */}
      {/* ========================================================== */}

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
              {config.more.map((group) => (
                <section key={group.title}>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {group.title}
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href + item.label}
                          to={item.href}
                          onClick={closeMore}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all active:scale-[0.98]",
                            active
                              ? "border-teal-500/20 bg-teal-500/10"
                              : "border-white/8 bg-white/3 hover:bg-white/6",
                          )}
                        >
                          <GlassIcon size="sm" variant="primary">
                            <Icon className="h-4 w-4" />
                          </GlassIcon>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">
                              {item.label}
                            </p>

                            <p className="truncate text-[11px] text-gray-500">
                              {item.description}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-600" />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
