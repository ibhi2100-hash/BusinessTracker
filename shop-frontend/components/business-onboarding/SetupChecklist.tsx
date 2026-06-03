"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";

export function SetupChecklist() {
  const router = useRouter();

  const items = [
    {
      label: "Upload Inventory",
      description: "Add your initial stock items",
      done: true,
      route: "/onboarding-inventory",
    },
    {
      label: "Opening Cash",
      description: "Set your starting balance",
      done: false,
      route: "/onboarding-opening-cash",
    },
    {
      label: "Business Assets",
      description: "Track equipment and properties",
      done: false,
      route: "/onboarding-assets",
    },
    {
      label: "Liabilities",
      description: "Record outstanding obligations",
      done: false,
      route: "/onboarding-liabilities",
    },
  ];

  return (
    <GlassCard className="overflow-hidden">
      {items.map((item, index) => (
        <button
          key={item.label}
          onClick={() => router.push(item.route)}
          className={`
            w-full
            flex
            items-center
            justify-between
            px-5
            py-5
            text-left
            transition-all
            duration-200
            hover:bg-white/[0.04]
            active:scale-[0.99]
            ${
              index !== items.length - 1
                ? "border-b border-white/5"
                : ""
            }
          `}
        >
          <div className="flex items-center gap-4">
            <GlassIcon
              variant={
                item.done
                  ? "success"
                  : "primary"
              }
            >
              {item.done ? (
                <CheckCircle2 size={20} />
              ) : (
                <div className="h-2.5 w-2.5 rounded-full bg-current" />
              )}
            </GlassIcon>

            <div>
              <p className="font-medium text-white">
                {item.label}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {item.description}
              </p>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-gray-500"
          />
        </button>
      ))}
    </GlassCard>
  );
}