import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Plus,
  Building2,
  ChevronDown,
} from "lucide-react";

import { useBranchStore } from "../../Biztru/store/useBranchStore";
import { BusinessEventTypes } from "@business/shared-types";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassIcon } from "../ui/GlassIcon";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useBusinessLiveQuery } from "../../hooks/useBusinessLiveQuery";


export function DashboardHeader() {
  const navigate = useNavigate();

  const {
    businessId,
  } = useBusinessContext();

  const { data } =
    useBusinessLiveQuery(businessId);

  const business = data;
  const role = "ADMIN";
  const app = useApplication();

  const {
    branches,
    activeBranchId,
    setActiveBranch,
  } = useBranchStore();

  const [isSwitching, setIsSwitching] =
    useState(false);


  /* =========================================================
     TIME-AWARE GREETING
     ========================================================= */

  const currentHour = new Date().getHours();

  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "Good morning"
      : currentHour >= 12 && currentHour < 17
        ? "Good afternoon"
        : currentHour >= 17 && currentHour < 21
          ? "Good evening"
          : "Good night";


  /* =========================================================
     BRANCH SWITCHING
     ========================================================= */

  const handleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;

    if (value === "add_new") {
      navigate("/branches/new");
      return;
    }

    if (
      value === activeBranchId ||
      isSwitching
    ) {
      return;
    }

    try {
      setIsSwitching(true);

      await app.branch.switchBranch({
        type:
          BusinessEventTypes.BRANCH_SWITCH,

        aggregateType:
          "BRANCH_SWITCH",

        aggregateId: value,

        payload: {
          branchId: value,
        },

        mode: "LIVE",
      });

      setActiveBranch(value);

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

        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="flex gap-4 min-w-0">

          <GlassIcon size="lg">
            <Building2 size={24} />
          </GlassIcon>


          <div className="min-w-0">

            {/* TIME-AWARE GREETING */}

            <p className="text-sm text-gray-400">
              {greeting}
            </p>


            {/* BUSINESS NAME */}

            <h1
              className="
                text-2xl
                font-bold
                truncate
              "
            >
              {business?.name}
            </h1>


            {/* BRANCH SELECTOR */}

            <div className="mt-3 relative">

              <select
                value={activeBranchId ?? ""}
                onChange={handleChange}
                disabled={isSwitching}
                className="
                  appearance-none
                  bg-white/4
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


            {/* SWITCHING STATUS */}

            {isSwitching && (
              <p className="mt-2 text-xs text-gray-400">
                Switching branch...
              </p>
            )}

          </div>
        </div>


        {/* =====================================================
            RIGHT
        ===================================================== */}

        <div className="flex items-center gap-2">

          {role === "ADMIN" && (
            <GlassButton
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() =>
                navigate("/branches/new")
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
