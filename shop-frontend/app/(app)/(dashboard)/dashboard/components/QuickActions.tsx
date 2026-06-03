"use client";

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
import { useAuthStore } from "@/src/store/useAuthStore";
import { ActionTile } from "@/components/ui/ActionTile";

export const QuickActions = () => {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);

  const actions = [
    { label: "Add Asset", icon: PlusCircle, path: "/assets/new" },
    { label: "Disposed Asset", icon: DollarSign, path: "/assets/disposed" },
    { label: "Add Liability", icon: Package, path: "/liabilities/new" },
    { label: "Repayment", icon: CreditCard, path: "/liabilities/repayment" },

    ...(role === "ADMIN"
      ? [
          { label: "Inject Capital", icon: ArrowDownCircle, path: "/capital/inject" },
          { label: "Withdraw", icon: ArrowUpCircle, path: "/capital/withdraw" },
          { label: "Transfer", icon: Repeat, path: "/capital/transfer" },
          { label: "Employees", icon: Users, path: "/management/employees" },
        ]
      : []),
  ];

  return (
    <section>
      <h3 className="text-sm text-gray-400 mb-3">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <ActionTile
            key={action.label}
            icon={<action.icon />}
            label={action.label}
            onClick={() =>
              router.push(action.path)
            }
          />
        ))}
      </div>
    </section>
  );
};