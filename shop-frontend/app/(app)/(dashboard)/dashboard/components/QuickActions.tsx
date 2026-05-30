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
        {actions.map((a) => {
          const Icon = a.icon;

          return (
            <button
              key={a.label}
              onClick={() => router.push(a.path)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition"
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm text-center">{a.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};