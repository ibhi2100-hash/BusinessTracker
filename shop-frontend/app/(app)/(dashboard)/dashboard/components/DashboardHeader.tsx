"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bell,
  Plus,
  Building2,
  ChevronDown,
} from "lucide-react";

import { useBranchStore } from "@/src/store/useBranchStore";
import { useBusinessStore } from "@/src/store/businessStore";
import { useAuthStore } from "@/src/store/useAuthStore";

import { eventService } from "@/src/services/eventService";
import { BusinessEventTypes } from "@business/shared-types";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";

export function DashboardHeader() {
  const router = useRouter();

  const business = useBusinessStore((s) => s.business);

  const role = useAuthStore(
    (s) => s.user?.role
  );

  const {
    branches,
    activeBranchId,
    setActiveBranch,
  } = useBranchStore();

  const [isSwitching, setIsSwitching] =
    useState(false);

  const handleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;

    if (value === "add_new") {
      router.push("/branches/new");
      return;
    }

    if (
      value === activeBranchId ||
      isSwitching
    )
      return;

    try {
      setIsSwitching(true);

      await eventService.create({
        type:
          BusinessEventTypes.BRANCH_SWITCH,
        aggregateType: "BRANCH_SWITCH",
        aggregateId: value,
        payload: {
          branchId: value,
        },
        mode: "LIVE",
      });

      setActiveBranch(value);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <GlassCard
      variant="elevated"
      className="p-5"
    >
      <div className="flex items-start justify-between gap-4">
        {/* LEFT */}
        <div className="flex gap-4 min-w-0">
          <GlassIcon size="lg">
            <Building2 size={24} />
          </GlassIcon>

          <div className="min-w-0">
            <p className="text-sm text-gray-400">
              Good Morning
            </p>

            <h1
              className="
              text-2xl
              font-bold
              truncate
            "
            >
              {business?.name}
            </h1>

            <div className="mt-3 relative">
              <select
                value={activeBranchId ?? ""}
                onChange={handleChange}
                disabled={isSwitching}
                className="
                  appearance-none
                  bg-white/[0.04]
                  border
                  border-white/10
                  rounded-xl
                  px-3
                  py-2
                  pr-8
                  text-sm
                  text-white
                  backdrop-blur-xl
                  outline-none
                  w-full
                "
              >
                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </option>
                ))}

                {role === "ADMIN" && (
                  <option value="add_new">
                    + Add Branch
                  </option>
                )}
              </select>

              <ChevronDown
                size={16}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  pointer-events-none
                "
              />
            </div>

            {isSwitching && (
              <p className="mt-2 text-xs text-gray-400">
                Switching branch...
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {role === "ADMIN" && (
            <GlassButton
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() =>
                router.push("/branches/new")
              }
              className="hidden sm:flex"
            >
              Branch
            </GlassButton>
          )}

          <GlassButton
            variant="secondary"
            className="px-3"
          >
            <Bell size={18} />
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}