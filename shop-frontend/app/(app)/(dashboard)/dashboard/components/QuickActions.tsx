
"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  CreditCard,
  DollarSign,
  Landmark,
  Package,
  PlusCircle,
  Repeat,
  Receipt,
  ShieldCheck,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { ActionTile } from "@/components/ui/ActionTile";

type Action = {
  label: string;
  description?: string;
  icon: React.ElementType;
  path: string;
  priority?: "frequent" | "normal" | "admin";
};

export const QuickActions = () => {
  const router = useRouter();

  const role = useAuthStore((s) => s.user?.role);

  /*
   * ------------------------------------------------------------
   * FREQUENT BRANCH LEVERS
   * ------------------------------------------------------------
   *
   * These are deliberately separated from the other actions.
   *
   * They represent actions a branch manager may need repeatedly
   * during ordinary branch operation.
   *
   * Keep this section small.
   */
  const frequentActions: Action[] = [
    {
      label: "Record Expense",
      description: "Spend branch cash",
      icon: Receipt,
      path: "/expenses/new",
      priority: "frequent",
    },

    {
      label: "Add Capital / Gain",
      description: "Add extra branch capital",
      icon: ArrowDownCircle,
      path: "/capital/inject",
      priority: "frequent",
    },
  ];

  /*
   * ------------------------------------------------------------
   * BRANCH OPERATING LEVERS
   * ------------------------------------------------------------
   *
   * These are legitimate business operations but normally occur
   * less frequently than expenses and capital adjustments.
   */
  const operatingActions: Action[] = [
    {
      label: "Add Asset",
      description: "Register a business asset",
      icon: PlusCircle,
      path: "/assets/new",
      priority: "normal",
    },

    {
      label: "Dispose Asset",
      description: "Remove or sell an asset",
      icon: XCircle,
      path: "/assets/disposed",
      priority: "normal",
    },

    {
      label: "Add Liability",
      description: "Record a new obligation",
      icon: Landmark,
      path: "/liabilities/new",
      priority: "normal",
    },

    {
      label: "Repayment",
      description: "Repay a liability",
      icon: CreditCard,
      path: "/liabilities/repayment",
      priority: "normal",
    },

    {
      label: "Cash Adjustment",
      description: "Correct an approved cash position",
      icon: WalletCards,
      path: "/cash/adjustment",
      priority: "normal",
    },

    {
      label: "Stock Adjustment",
      description: "Correct an approved inventory position",
      icon: Package,
      path: "/inventory/adjustment",
      priority: "normal",
    },
  ];

  /*
   * ------------------------------------------------------------
   * MANAGEMENT / ADMINISTRATION
   * ------------------------------------------------------------
   *
   * These are deliberately secondary.
   *
   * A manager may need them, but they should not compete visually
   * with the actions required to operate the branch every day.
   */
  const managementActions: Action[] = [
    {
      label: "Employees",
      description: "Manage branch personnel",
      icon: Users,
      path: "/management/employees",
      priority: "admin",
    },

    {
      label: "Transfer",
      description: "Move capital between branches",
      icon: Repeat,
      path: "/capital/transfer",
      priority: "admin",
    },

    {
      label: "Withdraw Capital",
      description: "Remove owner/business capital",
      icon: ArrowUpCircle,
      path: "/capital/withdraw",
      priority: "admin",
    },

    {
      label: "Branch Settings",
      description: "Configure branch operations",
      icon: Building2,
      path: "/management/branch",
      priority: "admin",
    },

    {
      label: "Controls & Audit",
      description: "Review operational controls",
      icon: ShieldCheck,
      path: "/management/controls",
      priority: "admin",
    },
  ];

  /*
   * ------------------------------------------------------------
   * ROLE FILTERING
   * ------------------------------------------------------------
   *
   * The UI should never be the security boundary.
   * Your backend/domain authorization must independently enforce
   * these permissions.
   *
   * This only determines what the user sees.
   */

  const visibleManagementActions =
    role === "ADMIN"
      ? managementActions
      : managementActions.filter(
          (action) =>
            ![
              "Transfer",
              "Withdraw Capital",
              "Branch Settings",
              "Controls & Audit",
            ].includes(action.label)
        );

  return (
    <section className="space-y-6">
      {/* ========================================================
          FREQUENT LEVERS
      ========================================================= */}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Branch Levers
            </h3>

            <p className="mt-0.5 text-[11px] text-gray-500">
              Frequent operating actions
            </p>
          </div>

          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-medium text-green-400">
            Frequent
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {frequentActions.map((action) => (
            <FrequentActionTile
              key={action.label}
              icon={action.icon}
              label={action.label}
              description={action.description}
              onClick={() => router.push(action.path)}
            />
          ))}
        </div>
      </div>

      {/* ========================================================
          OTHER OPERATING LEVERS
      ========================================================= */}

      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">
            Operating
          </h3>

          <p className="mt-0.5 text-[11px] text-gray-500">
            Less frequent branch operations
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {operatingActions.map((action) => (
            <SecondaryActionTile
              key={action.label}
              icon={action.icon}
              label={action.label}
              description={action.description}
              onClick={() => router.push(action.path)}
            />
          ))}
        </div>
      </div>

      {/* ========================================================
          MANAGEMENT
      ========================================================= */}

      {visibleManagementActions.length > 0 && (
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">
              Management
            </h3>

            <p className="mt-0.5 text-[11px] text-gray-500">
              Administrative and control operations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleManagementActions.map((action) => (
              <SecondaryActionTile
                key={action.label}
                icon={action.icon}
                label={action.label}
                description={action.description}
                onClick={() => router.push(action.path)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

/* ================================================================
   FREQUENT ACTION TILE
================================================================ */

interface FrequentActionTileProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
}

function FrequentActionTile({
  icon: Icon,
  label,
  description,
  onClick,
}: FrequentActionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        min-h-[132px]
        touch-manipulation
        rounded-3xl
        border border-green-500/20
        bg-gradient-to-br
        from-green-500/15
        via-white/[0.05]
        to-white/[0.02]
        p-5
        text-left
        shadow-[0_12px_40px_rgba(0,0,0,0.25)]
        transition-all
        duration-200
        hover:border-green-500/40
        hover:bg-green-500/10
        hover:shadow-[0_16px_50px_rgba(34,197,94,0.12)]
        focus:outline-none
        focus:ring-2
        focus:ring-green-500/50
        active:scale-[0.97]
        sm:min-h-[150px]
        sm:p-6
        lg:min-h-[175px]
      "
    >
      {/* Frequency indicator */}
      <span
        className="
          absolute
          right-4
          top-4
          rounded-full
          border
          border-green-500/20
          bg-green-500/10
          px-2
          py-1
          text-[9px]
          font-medium
          uppercase
          tracking-wide
          text-green-400
        "
      >
        Frequent
      </span>

      <div
        className="
          mb-5
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-green-500/10
          text-green-400
          transition-transform
          group-hover:scale-105
        "
      >
        <Icon className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm font-semibold text-white sm:text-base">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-[11px] leading-4 text-gray-500 sm:text-xs">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

/* ================================================================
   SECONDARY ACTION TILE
================================================================ */

interface SecondaryActionTileProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
}

function SecondaryActionTile({
  icon: Icon,
  label,
  description,
  onClick,
}: SecondaryActionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        min-h-[92px]
        touch-manipulation
        rounded-2xl
        border border-white/10
        bg-white/[0.035]
        p-4
        text-left
        transition-all
        duration-200
        hover:border-white/20
        hover:bg-white/[0.06]
        focus:outline-none
        focus:ring-2
        focus:ring-green-500/40
        active:scale-[0.97]
        lg:min-h-[105px]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white/5
            text-gray-400
            transition-colors
            group-hover:bg-white/10
            group-hover:text-gray-200
          "
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-200 sm:text-sm">
            {label}
          </p>

          {description && (
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-600 sm:text-[11px]">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
