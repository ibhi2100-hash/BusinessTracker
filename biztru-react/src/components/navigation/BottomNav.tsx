import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
  useMatch
} from "react-router-dom";

import {
  Home,
  ShoppingCart,
  Package,
  BarChart2,
  MoreHorizontal,
  Receipt,
  TrendingUp,
  LayoutGrid,
  GitCompare,
  CalendarRange,
  Boxes,
  Settings,
  Building2,
  Users,
  Wallet,
  FileText,
  X,
  ChevronRight,
  Zap,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  CreditCard,
  ArrowDownCircle,
  ArrowLeft
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";
import { cn } from "../../lib/utils";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useApplicationSession } from "../../Biztru/context/AplicationSessionContext";

import type { Role } from "@business/shared-types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type IconComponent = ComponentType<{
  className?: string;
}>;

type UserRole = Role;

type NavigationItem = {
  label: string;
  icon: IconComponent;
  href: string;
};

type MoreItem = {
  label: string;
  description?: string;
  href: string;
  icon: IconComponent;
  action?: "settings";
};

type MoreGroup = {
  title: string;
  items: MoreItem[];
};

type UpdateStatus =
  | "idle"
  | "updating"
  | "success"
  | "error";

interface AppUpdateResult {
  fromVersion?: number;
  toVersion?: number;
  applied?: unknown[];
}

function scopeNavigationToBranch(
  href: string,
  branchId: string
): string {
  return `/owner/branches/${branchId}${href}`;
}
/* ------------------------------------------------------------------ */
/* Staff navigation                                                   */
/* ------------------------------------------------------------------ */

const staffPrimaryNav: NavigationItem[] = [
  {
    label: "Sell",
    icon: ShoppingCart,
    href: "/sales",
  },
  {
    label: "Sales",
    icon: Receipt,
    href: "/sales/list",
  },
];

const staffMoreGroups: MoreGroup[] = [
  {
    title: "Sales",
    items: [
      {
        label: "Quick Sell",
        description: "Ring up a sale",
        href: "/sales",
        icon: Zap,
      },
      {
        label: "Sales list",
        description: "History and receipts",
        href: "/sales/list",
        icon: Receipt,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Manager navigation                                                 */
/* ------------------------------------------------------------------ */

const managerPrimaryNav: NavigationItem[] = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Sell",
    icon: ShoppingCart,
    href: "/sales",
  },
  {
    label: "Stock",
    icon: Package,
    href: "/inventory",
  },
  {
    label: "Reports",
    icon: BarChart2,
    href: "/reports",
  },
];

const managerMoreGroups: MoreGroup[] = [
  {
    title: "Sales",
    items: [
      {
        label: "Quick Sell",
        description: "Ring up a sale",
        href: "/sales",
        icon: Zap,
      },
      {
        label: "Sales list",
        description: "History and receipts",
        href: "/sales/list",
        icon: Receipt,
      },
      {
        label: "Sales analysis",
        description: "Revenue and margins",
        href: "/sales/analysis",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Record expense",
        description: "Cash leaving the branch",
        href: "/expenses",
        icon: ArrowDownCircle,
      },
      {
        label: "Cash and bank",
        description: "Branch money on hand",
        href: "/finance/cash",
        icon: Wallet,
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Dashboard",
        description: "Branch balances and P&L",
        href: "/reports",
        icon: LayoutGrid,
      },
      {
        label: "Month vs month",
        description: "Compare periods",
        href: "/reports/comparison",
        icon: GitCompare,
      },
      {
        label: "Yearly",
        description: "Multi-year view",
        href: "/reports/yearly",
        icon: CalendarRange,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Inventory",
        description: "Stock and products",
        href: "/inventory",
        icon: Package,
      },
      {
        label: "Projections",
        description: "Live projections",
        href: "/projection",
        icon: Boxes,
      },
      {
        label: "Sync Management",
        description: "Branch synchronization",
        href: "/sync-management",
        icon: RefreshCw,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Team",
        description: "Branch personnel",
        href: "/settings/team",
        icon: Users,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* CEO / ADMIN navigation                                             */
/* ------------------------------------------------------------------ */

const ownerPrimaryNav: NavigationItem[] = [
  {
    label: "Overview",
    icon: Home,
    href: "/owner-dashboard",
  },
  {
    label: "Branches",
    icon: Building2,
    href: "/settings/branches",
  },
  {
    label: "Reports",
    icon: BarChart2,
    href: "/owner-dashboard/reports",
  },
  {
    label: "Finance",
    icon: Wallet,
    href: "/owner-dashboard/finance",
  },
];

const ownerMoreGroups: MoreGroup[] = [
  {
    title: "Business Intelligence",
    items: [
      {
        label: "Business overview",
        description: "Consolidated business performance",
        href: "/owner-dashboard",
        icon: LayoutGrid,
      },
      {
        label: "Branch performance",
        description: "Compare all branches",
        href: "/owner-dashboard/branches",
        icon: Building2,
      },
      {
        label: "Financial reports",
        description: "Business-wide financial position",
        href: "/owner-dashboard/reports",
        icon: BarChart2,
      },
      {
        label: "Period comparison",
        description: "Compare business performance",
        href: "/owner-dashboard/reports/comparison",
        icon: GitCompare,
      },
    ],
  },
  {
    title: "Branch Supervision",
    items: [
      {
        label: "Branches",
        description: "Inspect and supervise branches",
        href: "/settings/branches",
        icon: Building2,
      },
      {
        label: "Branch employees",
        description: "Employees across branches",
        href: "/owner-dashboard/employees",
        icon: Users,
      },
      {
        label: "Business alerts",
        description: "Review business-wide alerts",
        href: "/owner-dashboard/alerts",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Cash and bank",
        description: "Consolidated cash position",
        href: "/owner-dashboard/finance",
        icon: Wallet,
      },
      {
        label: "Liabilities",
        description: "Business obligations",
        href: "/owner-dashboard/liabilities",
        icon: CreditCard,
      },
      {
        label: "Invoices",
        description: "Business documents",
        href: "/invoices",
        icon: FileText,
      },
    ],
  },
  {
    title: "Business Administration",
    items: [
      {
        label: "Team and permissions",
        description: "Manage users and roles",
        href: "/settings/team",
        icon: Users,
      },
      {
        label: "Business settings",
        description: "Business configuration",
        href: "/settings",
        icon: Settings,
        action: "settings",
      },
      {
        label: "Sync Management",
        description: "Monitor branch synchronization",
        href: "/sync-management",
        icon: RefreshCw,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function isActive(
  pathname: string,
  href: string,
): boolean {
  /*
   * These routes must match exactly.
   *
   * For example:
   * /sales/list must not activate /sales.
   * /owner-dashboard/reports must not activate
   * the main owner overview.
   */
  const exactMatchRoutes = [
    "/",
    "/dashboard",
    "/sales",
    "/owner-dashboard",
  ];

  if (exactMatchRoutes.includes(href)) {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function isUpdateResult(
  value: unknown,
): value is AppUpdateResult {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    (result.fromVersion === undefined ||
      typeof result.fromVersion === "number") &&
    (result.toVersion === undefined ||
      typeof result.toVersion === "number") &&
    (result.applied === undefined ||
      Array.isArray(result.applied))
  );
}

/* ------------------------------------------------------------------ */
/* Settings UI                                                        */
/* ------------------------------------------------------------------ */

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </p>

      <div className="space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: IconComponent;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center gap-3
        rounded-2xl
        border border-white/8
        bg-white/3
        px-3 py-3
        text-left
        transition-all
        hover:bg-white/6
        active:scale-[0.98]
      "
    >
      <GlassIcon size="sm" variant="primary">
        <Icon className="h-4 w-4" />
      </GlassIcon>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">
          {label}
        </p>

        <p className="truncate text-[11px] text-gray-500">
          {description}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-gray-600" />
    </button>
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
}: {
  to: string;
  label: string;
  icon: IconComponent;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
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
          compact
            ? "h-4 w-4 opacity-80"
            : "h-5 w-5",
        )}
      />

      <span className="truncate">
        {label}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AppNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { session } = useApplicationSession();
  const app = useApplication();

  /* ---------------------------------------------------------------- */
  /* Role resolution                                                  */
  /* ---------------------------------------------------------------- */

  const rawRole = session.user?.role;

  const role: UserRole | undefined =
    rawRole === "CEO" ||
    rawRole === "ADMIN" ||
    rawRole === "MANAGER" ||
    rawRole === "STAFF" ||
    rawRole === "SALES_REPS" ||
    rawRole === "CLEANER"
      ? rawRole
      : undefined;

  const isCEO = role === "CEO";
  const isAdmin = role === "ADMIN";

  /*
   * CEO and ADMIN both have owner-level navigation.
   * This is a navigation decision only.
   * Your route guards must still enforce actual permissions.
   */
  const isOwner = isCEO || isAdmin;

  const isManager = role === "MANAGER";

  const isStaff =
    role === "STAFF" ||
    role === "SALES_REPS";

  const branchMatch = useMatch(
  "/owner/branches/:branchId/*"
);

const activeBranchId = isOwner
  ? branchMatch?.params.branchId
  : undefined;

 const branchPrimaryNav = useMemo<NavigationItem[]>(() => {
    if (!activeBranchId) return [];

    return managerPrimaryNav.map((item) => ({
      ...item,
      href: scopeNavigationToBranch(
        item.href,
        activeBranchId
      ),
    }));
  }, [activeBranchId]);

  const branchMoreGroups = useMemo<MoreGroup[]>(() => {
    if (!activeBranchId) return [];

    const groups = managerMoreGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        href: scopeNavigationToBranch(
          item.href,
          activeBranchId
        ),
      })),
    }));

    return [
      ...groups,
      {
        title: "Business Workspace",
        items: [
          {
            label: "Return to Business",
            description: "Back to business-wide management",
            href: "/owner-dashboard",
            icon: Building2,
          },
        ],
      },
    ];
  }, [activeBranchId]);

const isOwnerInBranch = Boolean(activeBranchId);

  const primaryNav = useMemo<NavigationItem[]>(() => {
    // CEO/ADMIN inside a branch.
    if (isOwnerInBranch) return branchPrimaryNav;

    // CEO/ADMIN in the business workspace.
    if (isOwner) return ownerPrimaryNav;

    if (isManager) return managerPrimaryNav;

    if (isStaff) return staffPrimaryNav;

    return [];
  }, [
    isOwnerInBranch,
    branchPrimaryNav,
    isOwner,
    isManager,
    isStaff,
  ]);

  const moreGroups = useMemo<MoreGroup[]>(() => {
    if (isOwnerInBranch) return branchMoreGroups;

    if (isOwner) return ownerMoreGroups;

    if (isManager) return managerMoreGroups;

    if (isStaff) return staffMoreGroups;

    return [];
  }, [
    isOwnerInBranch,
    branchMoreGroups,
    isOwner,
    isManager,
    isStaff,
  ]);
  /* ---------------------------------------------------------------- */
  /* Overlay state                                                    */
  /* ---------------------------------------------------------------- */

  const [moreOpen, setMoreOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const [updateStatus, setUpdateStatus] =
    useState<UpdateStatus>("idle");

  const [updateResult, setUpdateResult] =
    useState<AppUpdateResult | null>(null);

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /* Close overlays when route changes                                */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    setMoreOpen(false);
    setSettingsOpen(false);
    setUpdateOpen(false);
  }, [pathname]);

  /* ---------------------------------------------------------------- */
  /* Close owner-only overlays when role changes                      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!isOwner) {
      setSettingsOpen(false);
      setUpdateOpen(false);
    }
  }, [isOwner]);

  /* ---------------------------------------------------------------- */
  /* Body scroll lock                                                 */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const overlayOpen =
      moreOpen ||
      settingsOpen ||
      updateOpen;

    if (!overlayOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    moreOpen,
    settingsOpen,
    updateOpen,
  ]);

  /* ---------------------------------------------------------------- */
  /* Navigation helpers                                               */
  /* ---------------------------------------------------------------- */

  const closeAllOverlays = useCallback(() => {
    setMoreOpen(false);
    setSettingsOpen(false);
    setUpdateOpen(false);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      closeAllOverlays();
      navigate(href);
    },
    [closeAllOverlays, navigate],
  );

  /* ---------------------------------------------------------------- */
  /* Settings                                                         */
  /* ---------------------------------------------------------------- */

  const openSettings = useCallback(() => {
    if (!isOwner) return;

    setMoreOpen(false);
    setUpdateOpen(false);
    setSettingsOpen(true);
  }, [isOwner]);

  /* ---------------------------------------------------------------- */
  /* App update                                                       */
  /* ---------------------------------------------------------------- */

  const openUpdate = useCallback(() => {
    if (!isOwner) return;

    setSettingsOpen(false);

    setUpdateStatus("idle");
    setUpdateResult(null);
    setUpdateError(null);

    setUpdateOpen(true);
  }, [isOwner]);

  const runAppUpdate = useCallback(async (): Promise<unknown> => {
    const system = (
      app as unknown as {
        system?: {
          update?: () => Promise<unknown>;
        };
      }
    )?.system;

    if (typeof system?.update !== "function") {
      throw new Error(
        "App update is not available on this device yet. Connect app.system.update().",
      );
    }

    return system.update();
  }, [app]);

  const handleAppUpdate = useCallback(async () => {
    if (
      !isOwner ||
      updateStatus === "updating"
    ) {
      return;
    }

    setUpdateStatus("updating");
    setUpdateResult(null);
    setUpdateError(null);

    try {
      const result = await runAppUpdate();

      setUpdateResult(
        isUpdateResult(result) ? result : null,
      );

      setUpdateStatus("success");
    } catch (error) {
      console.error("[App Update] Failed:", error);

      setUpdateError(
        error instanceof Error
          ? error.message
          : String(error),
      );

      setUpdateStatus("error");
    }
  }, [
    isOwner,
    runAppUpdate,
    updateStatus,
  ]);

  /* ---------------------------------------------------------------- */
  /* More menu                                                        */
  /* ---------------------------------------------------------------- */

  const handleMoreItem = useCallback(
    (item: MoreItem) => {
      if (item.action === "settings") {
        openSettings();
        return;
      }

      navigateTo(item.href);
    },
    [navigateTo, openSettings],
  );

 
  /* ---------------------------------------------------------------- */
  /* Labels                                                           */
  /* ---------------------------------------------------------------- */

  const workspaceLabel = isOwnerInBranch
    ? "BRANCH WORKSPACE"
    : isStaff
      ? "Sales Workspace"
      : "Business OS";

  const workspaceTitle = isOwnerInBranch
    ? "Branch Operations"
    : isStaff
      ? "Sales"
      : isManager
        ? "Branch Workspace"
        : "Workspace";

  const mobileMoreDescription = isOwnerInBranch
    ? "Branch operations and business workspace"
    : isStaff
      ? "Sales tools"
      : isManager
        ? "Branch sales, finance, reports and operations"
        : "Business intelligence, branches, finance and settings";
  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ============================================================ */}
      {/* Desktop sidebar                                              */}
      {/* ============================================================ */}

      <aside
        className="
          fixed bottom-0 left-0 top-0 z-40
          hidden w-64 flex-col
          border-r border-white/10
          bg-neutral-950/90
          backdrop-blur-2xl
          lg:flex
        "
        aria-label={
          isStaff
            ? "Sales navigation"
            : isManager
              ? "Branch navigation"
              : "Business navigation"
        }
      >
        {/* Header */}

        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-400/80">
            {workspaceLabel}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {workspaceTitle}
          </h2>

          {isStaff && (
            <p className="mt-1 text-[11px] text-gray-500">
              Sales operations
            </p>
          )}

          {isManager && (
            <p className="mt-1 text-[11px] text-gray-500">
              Branch operations
            </p>
          )}

          {isCEO && (
            <p className="mt-1 text-[11px] text-gray-500">
              CEO workspace
            </p>
          )}

          {isOwnerInBranch && (
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-2">
                <p className="text-[10px] text-teal-400">
                  ACTIVE BRANCH
                </p>

                <p className="mt-1 truncate text-xs font-medium text-white">
                  {activeBranchId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigateTo("/owner-dashboard")}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={14} />
                Return to Business
              </button>
            </div>
          )}
        </div>


        {/* Navigation */}

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {/* Primary navigation */}

          <div className="space-y-1">
            {primaryNav.map((item) => (
              <NavLinkRow
                key={item.href}
                to={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(pathname, item.href)}
              />
            ))}
          </div>

          {/* Secondary navigation */}

          {moreGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {group.title}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  /*
                   * Settings is an owner-only action.
                   * CEO and ADMIN can both open it.
                   */
                  if (item.action === "settings") {
                    if (!isOwner) return null;

                    const active = isActive(
                      pathname,
                      item.href,
                    );

                    return (
                      <button
                        key={`${item.href}-settings`}
                        type="button"
                        onClick={openSettings}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all",
                          active
                            ? "bg-teal-500/15 text-teal-300"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-80" />

                        <span className="truncate">
                          {item.label}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <NavLinkRow
                      key={`${group.title}-${item.href}-${item.label}`}
                      to={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive(pathname, item.href)}
                      compact
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ============================================================ */}
      {/* Mobile bottom navigation                                     */}
      {/* ============================================================ */}

      <div
        className="
          fixed bottom-4 left-3 right-3 z-50
          pb-[env(safe-area-inset-bottom)]
          lg:hidden
        "
      >
        <GlassCard
          variant="elevated"
          className="border-white/15 px-1.5 py-1.5"
        >
          <nav
            className="flex items-center justify-between"
            aria-label={
              isStaff
                ? "Sales navigation"
                : "Primary navigation"
            }
          >
            {primaryNav.map((item) => {
              const Icon = item.icon;

              const active = isActive(
                pathname,
                item.href,
              );

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
                      active
                        ? "text-teal-400"
                        : "text-gray-500",
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
                  moreOpen
                    ? "text-teal-400"
                    : "text-gray-500",
                )}
              >
                More
              </span>
            </button>
          </nav>
        </GlassCard>
      </div>

      {/* ============================================================ */}
      {/* Mobile More sheet                                            */}
      {/* ============================================================ */}

      {moreOpen && (
        <div
          className="
            fixed inset-0 z-[60]
            flex items-end justify-center
            lg:hidden
          "
          role="dialog"
          aria-modal="true"
          aria-label="More navigation"
        >
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close more navigation"
            className="
              absolute inset-0
              cursor-default
              bg-black/60
              backdrop-blur-md
            "
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}

          <div
            className="
              relative flex max-h-[85dvh] w-full
              animate-in flex-col
              rounded-t-[28px]
              border border-b-0 border-white/10
              bg-neutral-950/95
              shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
              duration-300 slide-in-from-bottom
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
                  {mobileMoreDescription}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close more navigation"
                onClick={() => setMoreOpen(false)}
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
              {moreGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {group.title}
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      const active = isActive(
                        pathname,
                        item.href,
                      );

                      if (
                        item.action === "settings" &&
                        !isOwner
                      ) {
                        return null;
                      }

                      return (
                        <button
                          key={`${group.title}-${item.href}-${item.label}`}
                          type="button"
                          onClick={() => handleMoreItem(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all active:scale-[0.98]",
                            active
                              ? "border-teal-500/25 bg-teal-500/10"
                              : "border-white/8 bg-white/3 hover:bg-white/6",
                          )}
                        >
                          <GlassIcon
                            size="sm"
                            variant="primary"
                          >
                            <Icon className="h-4 w-4" />
                          </GlassIcon>

                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                active
                                  ? "text-teal-300"
                                  : "text-white",
                              )}
                            >
                              {item.label}
                            </p>

                            {item.description && (
                              <p className="truncate text-[11px] text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-600" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* OWNER SETTINGS PANEL                                         */}
      {/* ============================================================ */}

      {isOwner && settingsOpen && (
        <div
          className="
            fixed inset-0 z-[70]
            flex items-end
            lg:items-center lg:justify-end
          "
          role="dialog"
          aria-modal="true"
          aria-label="Business settings"
        >
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close settings"
            className="
              absolute inset-0
              cursor-default
              bg-black/60
              backdrop-blur-md
            "
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}

          <div
            className="
              relative flex max-h-[88dvh] w-full
              animate-in flex-col
              rounded-t-[28px]
              border border-white/10
              bg-neutral-950/95
              shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
              duration-300 slide-in-from-bottom
              backdrop-blur-2xl

              lg:h-full lg:max-h-none
              lg:w-[430px]
              lg:rounded-none lg:rounded-l-[28px]
              lg:slide-in-from-right
            "
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                  Business
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Settings
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Configure your business workspace
                </p>
              </div>

              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
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

            <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <SettingsSection title="Business">
                <SettingsItem
                  icon={Building2}
                  label="Business profile"
                  description="Business identity and information"
                  onClick={() => navigateTo("/settings")}
                />

                <SettingsItem
                  icon={Building2}
                  label="Branches"
                  description="Manage business locations"
                  onClick={() => navigateTo("/settings/branches")}
                />

                <SettingsItem
                  icon={Users}
                  label="Team"
                  description="Users, roles and permissions"
                  onClick={() => navigateTo("/settings/team")}
                />
              </SettingsSection>

              <SettingsSection title="Operations">
                <SettingsItem
                  icon={ShoppingCart}
                  label="Sales"
                  description="Sales behavior and defaults"
                  onClick={() => navigateTo("/sales")}
                />

                <SettingsItem
                  icon={Package}
                  label="Inventory"
                  description="Inventory rules and defaults"
                  onClick={() => navigateTo("/inventory")}
                />

                <SettingsItem
                  icon={ArrowDownCircle}
                  label="Expenses"
                  description="Expense categories and defaults"
                  onClick={() => navigateTo("/expenses")}
                />

                <SettingsItem
                  icon={CreditCard}
                  label="Payments"
                  description="Payment methods and accounts"
                  onClick={() => navigateTo("/settings/payments")}
                />
              </SettingsSection>

              <SettingsSection title="Documents">
                <SettingsItem
                  icon={FileText}
                  label="Invoices"
                  description="Invoice and document configuration"
                  onClick={() => navigateTo("/invoices")}
                />
              </SettingsSection>

              <SettingsSection title="System">
                <SettingsItem
                  icon={RefreshCw}
                  label="App Update"
                  description="Database migrations and runtime updates"
                  onClick={openUpdate}
                />

                <SettingsItem
                  icon={RefreshCw}
                  label="Sync Management"
                  description="Manage device synchronization"
                  onClick={() => navigateTo("/sync-management")}
                />
              </SettingsSection>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* OWNER APP UPDATE PANEL                                       */}
      {/* ============================================================ */}

      {isOwner && updateOpen && (
        <div
          className="
            fixed inset-0 z-[80]
            flex items-end
            lg:items-center lg:justify-end
          "
          role="dialog"
          aria-modal="true"
          aria-label="App update"
        >
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close app update"
            disabled={updateStatus === "updating"}
            className="
              absolute inset-0
              cursor-default
              bg-black/60
              backdrop-blur-md
              disabled:cursor-not-allowed
            "
            onClick={() => {
              if (updateStatus !== "updating") {
                setUpdateOpen(false);
              }
            }}
          />

          {/* Panel */}

          <div
            className="
              relative flex max-h-[88dvh] w-full
              animate-in flex-col
              rounded-t-[28px]
              border border-white/10
              bg-neutral-950/95
              shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
              duration-300 slide-in-from-bottom
              backdrop-blur-2xl

              lg:mr-6 lg:h-auto
              lg:max-h-[90vh] lg:w-[430px]
              lg:rounded-[28px]
              lg:slide-in-from-right
            "
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                  System
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  App Update
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Update the local application runtime
                </p>
              </div>

              <button
                type="button"
                aria-label="Close app update"
                disabled={updateStatus === "updating"}
                onClick={() => setUpdateOpen(false)}
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-xl
                  bg-white/5 transition
                  hover:bg-white/10
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <X className="h-4 w-4 text-gray-300" />
              </button>
            </div>

            {/* Content */}

            <div className="overflow-y-auto p-5">
              {/* Idle */}

              {updateStatus === "idle" && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                    <div className="flex items-start gap-3">
                      <GlassIcon size="sm" variant="primary">
                        <Database className="h-4 w-4" />
                      </GlassIcon>

                      <div>
                        <p className="text-sm font-medium text-white">
                          Local database update
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          The app will apply any database migrations
                          newer than this device&apos;s current schema
                          version.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/3 p-4">
                    <div className="flex items-start gap-3">
                      <GlassIcon size="sm" variant="primary">
                        <ShieldCheck className="h-4 w-4" />
                      </GlassIcon>

                      <div>
                        <p className="text-sm font-medium text-white">
                          Runtime rebuild
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          After migration, the SQLite prepared
                          statement registry will be rebuilt against
                          the current schema.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleAppUpdate()}
                    className="
                      mt-5 flex w-full items-center
                      justify-center gap-2
                      rounded-2xl bg-teal-500
                      px-4 py-3 text-sm font-semibold
                      text-neutral-950 transition-all
                      hover:bg-teal-400
                      active:scale-[0.98]
                    "
                  >
                    <RefreshCw className="h-4 w-4" />
                    Update App
                  </button>
                </>
              )}

              {/* Updating */}

              {updateStatus === "updating" && (
                <div className="py-8">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-center text-base font-semibold text-white">
                    Updating application
                  </h3>

                  <p className="mt-2 text-center text-xs leading-5 text-gray-500">
                    Applying pending database migrations and
                    rebuilding prepared statements.
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-400" />

                      <span className="text-xs text-gray-300">
                        Updating local runtime…
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success */}

              {updateStatus === "success" && (
                <div className="py-4">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
                      <CheckCircle2 className="h-7 w-7 text-teal-400" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-center text-base font-semibold text-white">
                    App is up to date
                  </h3>

                  <p className="mt-2 text-center text-xs leading-5 text-gray-500">
                    The local database and prepared statement registry
                    have been synchronized with the application
                    schema.
                  </p>

                  {updateResult && (
                    <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4">
                      {typeof updateResult.fromVersion === "number" &&
                        typeof updateResult.toVersion === "number" && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Schema
                            </span>

                            <span className="text-xs font-medium text-white">
                              v{updateResult.fromVersion} → v
                              {updateResult.toVersion}
                            </span>
                          </div>
                        )}

                      {Array.isArray(updateResult.applied) && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Migrations applied
                          </p>

                          <p className="mt-1 text-sm font-medium text-teal-300">
                            {updateResult.applied.length}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="
                      mt-5 flex w-full items-center
                      justify-center gap-2
                      rounded-2xl bg-teal-500
                      px-4 py-3 text-sm font-semibold
                      text-neutral-950 transition-all
                      hover:bg-teal-400
                      active:scale-[0.98]
                    "
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload App
                  </button>
                </div>
              )}

              {/* Error */}

              {updateStatus === "error" && (
                <div className="py-4">
                  <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                      <AlertTriangle className="h-7 w-7 text-red-400" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-center text-base font-semibold text-white">
                    Update failed
                  </h3>

                  <p className="mt-2 text-center text-xs leading-5 text-gray-500">
                    The local update could not be completed.
                  </p>

                  {updateError && (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="wrap-break-word text-xs leading-5 text-red-300">
                        {updateError}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleAppUpdate()}
                    className="
                      mt-5 flex w-full items-center
                      justify-center gap-2
                      rounded-2xl border border-white/10
                      bg-white/10 px-4 py-3
                      text-sm font-semibold text-white
                      transition-all hover:bg-white/15
                      active:scale-[0.98]
                    "
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}