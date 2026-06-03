"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  ShoppingCart,
  Package,
  BarChart2,
  MoreHorizontal,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
    },
    {
      label: "Sales",
      icon: ShoppingCart,
      href: "/sales",
    },
    {
      label: "Inventory",
      icon: Package,
      href: "/inventory",
    },
    {
      label: "Reports",
      icon: BarChart2,
      href: "/reports",
    },
    {
      label: "More",
      icon: MoreHorizontal,
      href: "/more",
    },
  ];

  return (
    <div
      className="
      fixed
      bottom-4
      left-4
      right-4
      z-50
    "
    >
      <GlassCard
        variant="elevated"
        className="
          px-2
          py-2
        "
      >
        <nav
          className="
            flex
            items-center
            justify-between
          "
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  px-3
                  py-2
                  rounded-2xl
                  transition-all
                "
              >
                <div
                  className={
                    active
                      ? `
                        bg-teal-500/10
                        text-teal-400
                        p-2
                        rounded-xl
                      `
                      : `
                        text-gray-400
                        p-2
                      `
                  }
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span
                  className={
                    active
                      ? "text-xs text-teal-400"
                      : "text-xs text-gray-400"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </GlassCard>
    </div>
  );
}