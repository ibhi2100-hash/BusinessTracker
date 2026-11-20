
import {
  Building2,
  CreditCard,
  ShieldCheck,
  Settings,
  UserCog,
  ArrowRight,
} from "lucide-react";

import { GlassCard } from "../../../../components/ui/GlassCard";

import type {
  PlatformActivity,
} from "../types/dashboard.types";

interface RecentPlatformActivityProps {
  activities: PlatformActivity[];
  onViewAll?: () => void;
}

const categoryIcons = {
  TENANT: Building2,
  BILLING: CreditCard,
  SECURITY: ShieldCheck,
  SYSTEM: Settings,
  ADMIN: UserCog,
};

const categoryColors = {
  TENANT: "text-teal-400 bg-teal-400/10",
  BILLING: "text-emerald-400 bg-emerald-400/10",
  SECURITY: "text-amber-400 bg-amber-400/10",
  SYSTEM: "text-sky-400 bg-sky-400/10",
  ADMIN: "text-violet-400 bg-violet-400/10",
};

export function RecentPlatformActivity({
  activities,
  onViewAll,
}: RecentPlatformActivityProps) {
  return (
    <GlassCard variant="default" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Latest events across the platform
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium text-teal-400"
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {activities.map((activity, index) => {
          const Icon = categoryIcons[activity.category];

          return (
            <div
              key={activity.id}
              className="relative flex gap-3"
            >
              {index !== activities.length - 1 && (
                <div className="absolute bottom-[-20px] left-[17px] top-10 w-px bg-white/[0.08]" />
              )}

              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${categoryColors[activity.category]}`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>

                  <span className="text-[10px] text-white/30">
                    {activity.timestamp}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-white/45">
                  {activity.description}
                </p>

                <p className="mt-2 text-[10px] text-teal-400/80">
                  By {activity.actor}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
