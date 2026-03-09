import React from "react";
import {
  PlusCircle,
  DollarSign,
  Package,
  CreditCard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export const QuickActions = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const isOwner = user?.role === "ADMIN";

  const branchActions = [
    {
      label: "Add Asset",
      icon: PlusCircle,
      action: () => router.push("/assets/new"),
    },
    {
      label: "Disposed Asset",
      icon: DollarSign,
      action: () => router.push("/assets/disposed"),
    },
    {
      label: "Add Liability",
      icon: Package,
      action: () => router.push("/liabilities/new"),
    },
    {
      label: "Liability Repayment",
      icon: CreditCard,
      action: () => router.push("/liabilities/repayment"),
    },
  ];

  const ownerActions = [
    {
      label: "Inject Capital",
      icon: ArrowDownCircle,
      action: () => router.push("/capital/inject"),
    },
    {
      label: "Withdraw Funds",
      icon: ArrowUpCircle,
      action: () => router.push("/capital/withdraw"),
    },
    {
      label: "Transfer Funds",
      icon: Repeat,
      action: () => router.push("/capital/transfer"),
    },
    {
      label: "Manage Employees",
      icon: Users,
      action: () => router.push("/management/employees"),
    },
  ];

  const actions = isOwner
    ? [...branchActions, ...ownerActions]
    : branchActions;

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={action.action}
              className="bg-white rounded-2xl p-4 shadow flex flex-col items-center justify-center gap-2 hover:shadow-md transition"
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};