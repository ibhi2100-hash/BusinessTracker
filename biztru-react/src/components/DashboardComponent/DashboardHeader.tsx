import {
  Bell,
  Building2
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassIcon } from "../ui/GlassIcon";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useBusinessLiveQuery } from "../../hooks/useBusinessLiveQuery";


export function DashboardHeader() {

  const {
    businessId,
  } = useBusinessContext();

  const {
  data: business,
  loading: businessLoading,
  error: businessError,
} = useBusinessLiveQuery(businessId);

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

  return (
    <GlassCard
      variant="elevated"
      className="p-3"
    >
      <div className="flex items-start justify-between gap-4">

        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="flex gap-2 min-w-0">

          <GlassIcon size="lg">
            <Building2 size={24} />
          </GlassIcon>


          <div className="min-w-0">

            {/* TIME-AWARE GREETING */}

            <p className="text-sm text-gray-400">
              {greeting}
            </p>

            {/* BUSINESS NAME */}

            <h1 className="text-2xl font-bold truncate">
              {businessLoading
                ? "Loading business..."
                : businessError
                  ? "Unable to load business"
                  : business?.name ?? "Business unavailable"}
            </h1>
          </div>
        </div>


        {/* =====================================================
            RIGHT
        ===================================================== */}

        <div className="flex items-center gap-2">
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
