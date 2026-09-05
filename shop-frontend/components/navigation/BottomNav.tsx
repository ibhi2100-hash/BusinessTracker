"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Nav config                                                        */
/* ------------------------------------------------------------------ */

const primaryNav = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Sell", icon: ShoppingCart, href: "/sales" },
  { label: "Stock", icon: Package, href: "/inventory" },
  { label: "Reports", icon: BarChart2, href: "/reports" },
] as const;

type MoreGroup = {
  title: string;
  items: {
    label: string;
    description?: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
};

const moreGroups: MoreGroup[] = [
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
        description: "History & receipts",
        href: "/sales/list",
        icon: Receipt,
      },
      {
        label: "Sales analysis",
        description: "Revenue & margins",
        href: "/sales/analysis",
        icon: TrendingUp,
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        label: "Dashboard",
        description: "Balances & P&L",
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
        description: "Stock & products",
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
        label: "Cash & bank",
        description: "Money on hand",
        href: "/finance/cash",
        icon: Wallet,
      },
      {
        label: "Sync Management",
        description: "Sync device & server",
        href: "/sync-management",
        icon: RefreshCw,
      },
    ],
  },

  {
    title: "Business",
    items: [
      {
        label: "Branches",
        description: "Locations",
        href: "/settings/branches",
        icon: Building2,
      },
      {
        label: "Team",
        description: "Users & roles",
        href: "/settings/team",
        icon: Users,
      },
      {
        label: "Invoices",
        description: "Documents",
        href: "/invoices",
        icon: FileText,
      },
      {
        label: "Settings",
        description: "App preferences",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Active route helper                                               */
/* ------------------------------------------------------------------ */

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname === href || pathname.startsWith(href + "/");
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [moreOpen, setMoreOpen] = useState(false);

  /*
   * Close More on route change.
   */
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  /*
   * Lock body scroll when More sheet is open.
   */
  useEffect(() => {
    if (!moreOpen) return;

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  return (
    <>
      {/* ============================================================= */}
      {/* DESKTOP SIDEBAR                                               */}
      {/* ============================================================= */}

      <aside
        className="
          hidden lg:flex
          fixed left-0 top-0 bottom-0 z-40
          w-64
          flex-col
          border-r border-white/10
          bg-neutral-950/90
          backdrop-blur-2xl
        "
      >
        {/* ----------------------------------------------------------- */}
        {/* Workspace header                                            */}
        {/* ----------------------------------------------------------- */}

        <div className="px-5 py-6 border-b border-white/10">
          <p
            className="
              text-xs
              font-medium
              text-teal-400/80
              tracking-wide
              uppercase
            "
          >
            Business OS
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Workspace
          </h2>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Navigation                                                   */}
        {/* ----------------------------------------------------------- */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-4
            space-y-6
          "
        >
          {/* ========================================================= */}
          {/* Primary navigation                                        */}
          {/* ========================================================= */}

          <div className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;

              const active = isActive(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    `
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-xl
                      text-sm
                      transition-all
                    `,

                    active
                      ? "bg-teal-500/15 text-teal-300"
                      : `
                        text-gray-400
                        hover:bg-white/5
                        hover:text-gray-200
                      `
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* Grouped secondary navigation                               */}
          {/* ========================================================= */}

          {moreGroups.map((group) => (
            <div key={group.title}>
              <p
                className="
                  px-3
                  mb-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-gray-500
                "
              >
                {group.title}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const active = isActive(
                    pathname,
                    item.href
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        `
                          flex
                          items-center
                          gap-3
                          px-3
                          py-2
                          rounded-xl
                          text-sm
                          transition-all
                        `,

                        active
                          ? "bg-teal-500/15 text-teal-300"
                          : `
                            text-gray-400
                            hover:bg-white/5
                            hover:text-gray-200
                          `
                      )}
                    >
                      <Icon
                        className="
                          w-4
                          h-4
                          shrink-0
                          opacity-80
                        "
                      />

                      <span className="truncate">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ============================================================= */}
      {/* MOBILE BOTTOM BAR                                             */}
      {/* ============================================================= */}

      <div
        className="
          lg:hidden
          fixed
          bottom-4
          left-3
          right-3
          z-50
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <GlassCard
          variant="elevated"
          className="
            px-1.5
            py-1.5
            border-white/15
          "
        >
          <nav className="flex items-center justify-between">

            {/* ------------------------------------------------------- */}
            {/* Primary navigation                                      */}
            {/* ------------------------------------------------------- */}

            {primaryNav.map((item) => {
              const Icon = item.icon;

              const active = isActive(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    flex
                    flex-1
                    flex-col
                    items-center
                    justify-center
                    gap-0.5
                    py-1.5
                    rounded-2xl
                    transition-all
                    active:scale-95
                  "
                >
                  <div
                    className={cn(
                      `
                        p-2
                        rounded-xl
                        transition-colors
                      `,

                      active
                        ? "bg-teal-500/15 text-teal-400"
                        : "text-gray-400"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={cn(
                      `
                        text-[10px]
                        font-medium
                      `,

                      active
                        ? "text-teal-400"
                        : "text-gray-500"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* ------------------------------------------------------- */}
            {/* More                                                     */}
            {/* ------------------------------------------------------- */}

            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="
                flex
                flex-1
                flex-col
                items-center
                justify-center
                gap-0.5
                py-1.5
                rounded-2xl
                transition-all
                active:scale-95
              "
            >
              <div
                className={cn(
                  `
                    p-2
                    rounded-xl
                    transition-colors
                  `,

                  moreOpen
                    ? "bg-teal-500/15 text-teal-400"
                    : "text-gray-400"
                )}
              >
                <MoreHorizontal className="w-5 h-5" />
              </div>

              <span
                className={cn(
                  `
                    text-[10px]
                    font-medium
                  `,

                  moreOpen
                    ? "text-teal-400"
                    : "text-gray-500"
                )}
              >
                More
              </span>
            </button>
          </nav>
        </GlassCard>
      </div>

      {/* ============================================================= */}
      {/* MORE SHEET                                                    */}
      {/* ============================================================= */}

      {moreOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            z-[60]
            flex
            items-end
            justify-center
          "
        >
          {/* --------------------------------------------------------- */}
          {/* Backdrop                                                   */}
          {/* --------------------------------------------------------- */}

          <div
            className="
              absolute
              inset-0
              bg-black/60
              backdrop-blur-md
            "
            onClick={() => setMoreOpen(false)}
          />

          {/* --------------------------------------------------------- */}
          {/* Sheet                                                      */}
          {/* --------------------------------------------------------- */}

          <div
            className="
              relative
              w-full
              max-h-[85dvh]
              rounded-t-[28px]
              border
              border-white/10
              border-b-0
              bg-neutral-950/95
              backdrop-blur-2xl
              shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
              flex
              flex-col
              animate-in
              slide-in-from-bottom
              duration-300
            "
          >
            {/* ------------------------------------------------------- */}
            {/* Handle                                                    */}
            {/* ------------------------------------------------------- */}

            <div className="flex justify-center pt-3 pb-1">
              <div
                className="
                  h-1.5
                  w-12
                  rounded-full
                  bg-white/20
                "
              />
            </div>

            {/* ------------------------------------------------------- */}
            {/* Header                                                    */}
            {/* ------------------------------------------------------- */}

            <div
              className="
                flex
                items-center
                justify-between
                px-5
                py-3
                border-b
                border-white/10
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  More
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  Sales, reports, projections & settings
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/5
                  hover:bg-white/10
                  transition
                "
              >
                <X className="w-4 h-4 text-gray-300" />
              </button>
            </div>

            {/* ------------------------------------------------------- */}
            {/* Content                                                   */}
            {/* ------------------------------------------------------- */}

            <div
              className="
                flex-1
                overflow-y-auto
                px-4
                py-4
                pb-[max(1.5rem,env(safe-area-inset-bottom))]
                space-y-6
              "
            >
              {moreGroups.map((group) => (
                <div key={group.title}>

                  <p
                    className="
                      px-1
                      mb-2
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    {group.title}
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      const active = isActive(
                        pathname,
                        item.href
                      );

                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            setMoreOpen(false);
                            router.push(item.href);
                          }}
                          className={cn(
                            `
                              w-full
                              flex
                              items-center
                              gap-3
                              px-3
                              py-3
                              rounded-2xl
                              border
                              transition-all
                              active:scale-[0.98]
                              text-left
                            `,

                            active
                              ? `
                                bg-teal-500/10
                                border-teal-500/25
                              `
                              : `
                                bg-white/[0.03]
                                border-white/8
                                hover:bg-white/[0.06]
                              `
                          )}
                        >
                          {/* Icon */}

                          <GlassIcon
                            size="sm"
                            variant="primary"
                          >
                            <Icon className="w-4 h-4" />
                          </GlassIcon>

                          {/* Label */}

                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium",

                                active
                                  ? "text-teal-300"
                                  : "text-white"
                              )}
                            >
                              {item.label}
                            </p>

                            {item.description && (
                              <p
                                className="
                                  text-[11px]
                                  text-gray-500
                                  truncate
                                "
                              >
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Chevron */}

                          <ChevronRight
                            className="
                              w-4
                              h-4
                              text-gray-600
                              shrink-0
                            "
                          />
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

      {/* ============================================================= */}
      {/* Desktop content offset helper                                 */}
      {/*                                                             */}
      {/* Use className="lg:pl-64" on the main application content.     */}
      {/* ============================================================= */}
    </>
  );
}
