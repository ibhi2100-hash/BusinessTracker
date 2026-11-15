
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";

interface CEOAction {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant?: "primary" | "success" | "danger";
}

interface CEOActionCentreProps {
  onAction: (action: string) => void;
}

const actions: CEOAction[] = [
  {
    id: "inject-capital",
    path: "inject-capital",
    label: "Add Business Capital",
    description: "Increase business working capital",
    icon: <ArrowDownToLine size={20} />,
    variant: "success",
  },
  {
    id: "withdraw-capital",
    path: "/withdraw-capital",
    label: "Withdraw Capital",
    description: "Withdraw funds from the business",
    icon: <ArrowUpFromLine size={20} />,
    variant: "danger",
  },
  {
    id: "business-expense",
    path: "/business-expense",
    label: "General Expenses",
    description: "Record expenses outside branch operations",
    icon: <ReceiptText size={20} />,
  },
  {
    id: "cash-position",
    path: "cash-position",
    label: "Business Cash Position",
    description: "Review consolidated cash balances",
    icon: <Wallet size={20} />,
  },
  {
    id: "subscription",
    path: "/settings/billing",
    label: "Billing & Subscription",
    description: "Manage your BizTru subscription",
    icon: <CreditCard size={20} />,
  },
];

export function CEOActionCentre({
  onAction,
}: CEOActionCentreProps) {
  const iconVariants = {
    primary: "primary",
    success: "success",
    danger: "danger",
  } as const;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">
          Business Management
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Business-wide management and financial controls
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.path)}
            className="text-left"
          >
            <GlassCard className="h-full p-4 flex flex-col gap-3 hover:bg-white/[0.06] transition-colors">
              <GlassIcon
                size="md"
                variant={
                  iconVariants[action.variant ?? "primary"]
                }
              >
                {action.icon}
              </GlassIcon>

              <div>
                <p className="text-sm font-medium">
                  {action.label}
                </p>

                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </GlassCard>
          </button>
        ))}
      </div>
    </section>
  );
}
