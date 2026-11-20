
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";

import { GlassCard } from "../../../../components/ui/GlassCard";
import { GlassIcon } from "../../../../components/ui/GlassIcon";

import type {
  PlatformServiceHealth,
} from "../types/dashboard.types";

interface SystemHealthPanelProps {
  services: PlatformServiceHealth[];
  onViewAll?: () => void;
}

const statusConfig = {
  OPERATIONAL: {
    label: "Operational",
    icon: CheckCircle2,
    className: "text-teal-400 bg-teal-400/10",
    dot: "bg-teal-400",
  },
  DEGRADED: {
    label: "Degraded",
    icon: AlertTriangle,
    className: "text-amber-400 bg-amber-400/10",
    dot: "bg-amber-400",
  },
  OUTAGE: {
    label: "Outage",
    icon: XCircle,
    className: "text-rose-400 bg-rose-400/10",
    dot: "bg-rose-400",
  },
};

export function SystemHealthPanel({
  services,
  onViewAll,
}: SystemHealthPanelProps) {
  const operational = services.filter(
    (service) => service.status === "OPERATIONAL",
  ).length;

  const degraded = services.filter(
    (service) => service.status === "DEGRADED",
  ).length;

  const outages = services.filter(
    (service) => service.status === "OUTAGE",
  ).length;

  return (
    <GlassCard variant="default" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GlassIcon
            icon="activity"
            size="md"
            variant="success"
          />

          <div>
            <h2 className="font-semibold text-white">
              Infrastructure Health
            </h2>
            <p className="text-xs text-white/40">
              Platform service monitoring
            </p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300"
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-teal-400/[0.07] p-3">
          <p className="text-xl font-bold text-teal-400">
            {operational}
          </p>
          <p className="mt-1 text-[10px] text-white/40">
            Operational
          </p>
        </div>

        <div className="rounded-xl bg-amber-400/[0.07] p-3">
          <p className="text-xl font-bold text-amber-400">
            {degraded}
          </p>
          <p className="mt-1 text-[10px] text-white/40">
            Degraded
          </p>
        </div>

        <div className="rounded-xl bg-rose-400/[0.07] p-3">
          <p className="text-xl font-bold text-rose-400">
            {outages}
          </p>
          <p className="mt-1 text-[10px] text-white/40">
            Outages
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {services.map((service) => {
          const status = statusConfig[service.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {service.name}
                  </p>

                  <p className="truncate text-xs text-white/40">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium ${status.className}`}
                >
                  <StatusIcon size={11} />
                  {status.label}
                </span>

                <span className="text-[10px] text-white/40">
                  {service.latency}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
