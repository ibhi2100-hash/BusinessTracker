
import {
  Bell,
  Building2,
  MapPin,
  Store,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassIcon } from "../ui/GlassIcon";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useBusinessLiveQuery } from "../../hooks/useBusinessLiveQuery";
import { useBranchesLiveQuery } from "../../hooks/useBranches";

import { useParams } from "react-router-dom";

export function DashboardHeader() {

  /* =========================================================
     IDENTIFIERS
  ========================================================= */

  const { branchId: routerId } = useParams<{
    branchId: string;
  }>();

  const {
    branchId: contextBranchId,
    businessId,
  } = useBusinessContext();

  // Router ID takes priority over context ID.
  const branchId = routerId ?? contextBranchId;

  /* =========================================================
     BUSINESS DATA
  ========================================================= */

  /* =========================================================
     BRANCH DATA
  ========================================================= */

  const {
    data: branches,
    loading: branchesLoading,
    error: branchesError,
  } = useBranchesLiveQuery(businessId);

  // Find the branch currently being viewed.
  const currentBranch = branches?.find(
    (branch) => branch.id === branchId
  );

  // All other branches, excluding the current branch.
  const otherBranches = branches?.filter(
    (branch) => branch.id !== branchId
  ) ?? [];

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
     RENDER
  ========================================================= */

  return (
    <GlassCard
      variant="elevated"
      className="p-3"
    >
      <div className="flex items-start justify-between gap-4">

        {/* =====================================================
            LEFT: BUSINESS AND BRANCH IDENTITY
        ===================================================== */}

        <div className="flex gap-3 min-w-0">

          <GlassIcon size="lg">
            <Building2 size={24} />
          </GlassIcon>

          <div className="min-w-0">

            {/* GREETING */}

            <p className="text-sm text-gray-400">
              {greeting}
            </p>

            {/* BUSINESS NAME */}

            <h1 className="text-xl font-bold truncate">
              {branchesLoading
                ? "Loading Branch..."
                : branchesError
                  ? "Unable to load business"
                  : currentBranch?.name ?? "BranchUnAvailable unavailable"}
            </h1>

            {/* CURRENT BRANCH */}

            <div className="flex items-center gap-1.5 mt-1">

              <Store
                size={14}
                className="text-teal-400 shrink-0"
              />

              <p className="text-sm text-teal-400 font-medium truncate">
                {branchesLoading
                  ? "Loading branch..."
                  : branchesError
                    ? "Unable to load branch"
                    : currentBranch?.address ?? "Branch Address unavailable"}
              </p>

            </div>

            {/* BRANCH LOCATION */}

            {currentBranch?.address && (
              <div className="flex items-center gap-1.5 mt-1">

                <MapPin
                  size={12}
                  className="text-gray-500 shrink-0"
                />

                <p className="text-xs text-gray-400 truncate">
                  {currentBranch.address}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* =====================================================
            RIGHT: ACTIONS
        ===================================================== */}

        <div className="flex items-center gap-2 shrink-0">

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
