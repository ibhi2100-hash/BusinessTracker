
import {
  Building2,
  Plus,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  BranchPerformanceCard,
  type BranchPerformance,
} from "../BranchPerformanceCard"
import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassIcon } from "../../../components/ui/GlassIcon";
import { GlassButton } from "../../../components/ui/GlassButton";

import { useBusinessContext } from "../../../Biztru/context/BusinessContext";
import { useBusinessLiveQuery } from "../../../hooks/useBusinessLiveQuery";
import { useLiveBusinessDashboard } from "../../../hooks/Business/useLiveBusinessDashboard";

/* ============================================================
   PAGE
   ============================================================ */

export default function BranchesPage() {
  const navigate = useNavigate();

  const { businessId } = useBusinessContext();

  /* ----------------------------------------------------------
     BUSINESS PROFILE
     ---------------------------------------------------------- */

  const {
    data: business,
    loading: businessLoading,
    error: businessError,
  } = useBusinessLiveQuery(businessId);

  /* ----------------------------------------------------------
     BUSINESS DASHBOARD DATA
     ---------------------------------------------------------- */

  const {
    data: dashboard,
    loading: dashboardLoading,
    error: dashboardError,
  } = useLiveBusinessDashboard(businessId);

  const branches = dashboard?.branches ?? [];

  const loading = businessLoading || dashboardLoading;
  const error = businessError || dashboardError;

  /* ----------------------------------------------------------
     BRANCH PERFORMANCE DATA
     ---------------------------------------------------------- */

  const branchCards: BranchPerformance[] = branches.map(
    (branch) => ({
      id: branch.id,
      name: branch.name,
      location: branch.location || "Location not provided",
      status: branch.status,
      manager: branch.manager || "Unassigned",
      todaySales: branch.todaySales ?? 0,
      revenue: branch.revenue ?? 0,
      netProfit: branch.netProfit ?? 0,
      inventoryValue: branch.inventoryValue ?? 0,
      cash: branch.cash ?? 0,
      salesCount: branch.salesCount ?? 0,
    })
  );

  /* ----------------------------------------------------------
     BRANCH STATISTICS
     ---------------------------------------------------------- */

  const activeBranches = branches.filter(
    (branch) => branch.status === "ACTIVE"
  ).length;

  const attentionBranches = branches.filter(
    (branch) => branch.status === "ATTENTION"
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => branch.status === "INACTIVE"
  ).length;

  /* ----------------------------------------------------------
     NAVIGATION
     ---------------------------------------------------------- */

    const handleBranchSelection = (branch: BranchPerformance) => {
        navigate(`/owner/branches/${branch.id}`);
    };

    const handleControlRoomSelection = (branch: BranchPerformance) => {
        navigate(
            `/owner/branches/${branch.id}/control-room`
        );
        };
  const handleAddBranch = () => {
    navigate("/owner/branches/add");
  };

  /* ----------------------------------------------------------
     LOADING STATE
     ---------------------------------------------------------- */

  if (loading) {
    return (
      <div className="px-4 pb-24 space-y-5 animate-pulse">

        <div className="h-28 rounded-3xl bg-white/5 border border-white/10" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl bg-white/5 border border-white/10"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-3xl bg-white/5 border border-white/10"
            />
          ))}
        </div>

      </div>
    );
  }

  /* ----------------------------------------------------------
     ERROR STATE
     ---------------------------------------------------------- */

  if (error) {
    return (
      <div className="px-4 py-8">

        <GlassCard className="p-5 space-y-3">

          <GlassIcon variant="danger" size="lg">
            <RefreshCw size={22} />
          </GlassIcon>

          <h2 className="font-semibold text-red-400">
            Unable to load branches
          </h2>

          <p className="text-sm text-white/60">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading branch information."}
          </p>

          <GlassButton
            variant="secondary"
            onClick={() => navigate(0)}
            icon={<RefreshCw size={16} />}
          >
            Refresh Page
          </GlassButton>

        </GlassCard>

      </div>
    );
  }

  /* ----------------------------------------------------------
     BUSINESS CONTEXT VALIDATION
     ---------------------------------------------------------- */

  if (!businessId || !dashboard) {
    return (
      <div className="px-4 py-8">

        <GlassCard className="p-5 space-y-2">

          <h2 className="font-semibold">
            Branch information unavailable
          </h2>

          <p className="text-sm text-white/50">
            No business dashboard data is currently available.
            Check your business context and try again.
          </p>

        </GlassCard>

      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="px-4 pb-24 space-y-6">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <GlassCard variant="elevated" className="p-4">

        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">

            <GlassIcon size="lg">
              <Building2 size={23} />
            </GlassIcon>

            <div className="min-w-0">

              <p className="text-xs text-white/50">
                Business Management
              </p>

              <h1 className="text-xl font-semibold truncate">
                Branches
              </h1>

              <p className="text-xs text-white/50 mt-1">
                {business?.name || "Your Business"}
              </p>

            </div>

          </div>

          <GlassButton
            variant="secondary"
            className="shrink-0"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/owner-dashboard")}
          >
            Back
          </GlassButton>

        </div>

        <div className="mt-4 pt-4 border-t border-white/10">

          <p className="text-sm text-white/70">
            Monitor the performance of every branch and open
            its dedicated Control Room to manage operations.
          </p>

        </div>

      </GlassCard>

      {/* ======================================================
          BRANCH SUMMARY
          ====================================================== */}

      <section className="space-y-3">

        <div>
          <h2 className="text-base font-semibold">
            Branch Overview
          </h2>

          <p className="text-xs text-white/50 mt-1">
            Current branch distribution
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          <GlassCard className="p-3">
            <p className="text-xs text-white/50">
              Total Branches
            </p>

            <p className="text-2xl font-semibold mt-2">
              {branches.length}
            </p>
          </GlassCard>

          <GlassCard className="p-3">
            <p className="text-xs text-white/50">
              Active
            </p>

            <p className="text-2xl font-semibold text-emerald-400 mt-2">
              {activeBranches}
            </p>
          </GlassCard>

          <GlassCard className="p-3">
            <p className="text-xs text-white/50">
              Attention
            </p>

            <p className="text-2xl font-semibold text-amber-400 mt-2">
              {attentionBranches}
            </p>
          </GlassCard>

          <GlassCard className="p-3">
            <p className="text-xs text-white/50">
              Inactive
            </p>

            <p className="text-2xl font-semibold text-white/60 mt-2">
              {inactiveBranches}
            </p>
          </GlassCard>

        </div>

      </section>

      {/* ======================================================
          ALL BRANCHES
          ====================================================== */}

      <section className="space-y-4">

        {/* SECTION HEADER */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-base font-semibold">
              All Branches
            </h2>

            <p className="text-xs text-white/50 mt-1">
              Branch performance and operational access
            </p>

          </div>

          <GlassButton
            variant="primary"
            className="shrink-0"
            icon={<Plus size={16} />}
            onClick={handleAddBranch}
          >
            Add Branch
          </GlassButton>

        </div>

        {/* EMPTY STATE */}

        {branchCards.length === 0 ? (

          <GlassCard className="p-7 text-center space-y-3">

            <GlassIcon size="lg">
              <Building2 size={25} />
            </GlassIcon>

            <h3 className="font-semibold">
              No branches found
            </h3>

            <p className="text-sm text-white/50 max-w-sm mx-auto">
              Your business currently has no registered branches.
              Create your first branch to start expanding your operations.
            </p>

            <div className="flex justify-center pt-2">

              <GlassButton
                variant="primary"
                icon={<Plus size={16} />}
                onClick={handleAddBranch}
              >
                Create Your First Branch
              </GlassButton>

            </div>

          </GlassCard>

        ) : (

          /* BRANCH PERFORMANCE GRID */

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">

            {branchCards.map((branch) => (

              <div key={branch.id} className="min-w-0">

                <BranchPerformanceCard
                  branch={branch}
                  onClick={handleBranchSelection}
                  onControlRoomClick={handleControlRoomSelection}
                  showControlRoomButton={true}
                />

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}
