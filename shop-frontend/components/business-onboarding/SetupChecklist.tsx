// components/business-onboarding/SetupChecklist.tsx
"use client";

import clsx from "clsx";
import {
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import { useRouter } from "next/navigation";

export const SetupChecklist = () => {
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
    <div
      className="
        relative
        overflow-hidden
        rounded-[34px]
        border
        border-white/10
        bg-white/[0.07]
        backdrop-blur-3xl
        shadow-[0_10px_60px_rgba(0,0,0,0.45)]
      "
    >

      {/* GLASS OVERLAY */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_35%)]
        "
      />

      {items.map((item, index) => (
        <button
          key={item.label}
          onClick={() => router.push(item.route)}
          className={clsx(
            `
            relative
            z-10
            flex
            w-full
            items-center
            justify-between
            px-5
            py-5
            text-left
            transition-all
            duration-200
            active:scale-[0.992]
            `,
            index !== items.length - 1 &&
              "border-b border-white/5"
          )}
        >
          <div className="flex items-center gap-4">

            {/* ICON */}
            <div
              className={clsx(
                `
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                backdrop-blur-xl
                `,
                item.done
                  ? "border-green-400/20 bg-green-400/15"
                  : "border-white/10 bg-white/[0.05]"
              )}
            >

              {/* INNER LIGHT */}
              <div
                className="
                  absolute
                  inset-0
                  rounded-2xl
                  bg-[linear-gradient(140deg,rgba(255,255,255,0.15),transparent)]
                "
              />

              {item.done ? (
                <CheckCircle2
                  size={22}
                  className="relative z-10 text-green-400"
                />
              ) : (
                <div
                  className="
                    relative
                    z-10
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-white/30
                  "
                />
              )}
            </div>

            {/* TEXT */}
            <div>
              <p className="text-[16px] font-medium text-white">
                {item.label}
              </p>

              <p className="mt-1 text-sm text-white/40">
                {item.description}
              </p>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="text-white/30"
          />
        </button>
      ))}
    </div>
  );
};