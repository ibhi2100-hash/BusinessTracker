
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { GlassCard } from "../../../../components/ui/GlassCard";
import type {
  PlatformAlert,
} from "../types/dashboard.types";

interface PlatformAlertsProps {
  alerts: PlatformAlert[];
  onViewAll?: () => void;
  onOpenAlert?: (alert: PlatformAlert) => void;
}

const severityConfig = {
  INFO: {
    icon: Info,
    color: "text-sky-400",
    background: "bg-sky-400/10",
    label: "Information",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-400",
    background: "bg-amber-400/10",
    label: "Warning",
  },
  CRITICAL: {
    icon: AlertCircle,
    color: "text-rose-400",
    background: "bg-rose-400/10",
    label: "Critical",
  },
};

export function PlatformAlerts({
  alerts,
  onViewAll,
  onOpenAlert,
}: PlatformAlertsProps) {
  const unresolved = alerts.filter(
    (alert) => !alert.resolved,
  );

  return (
    <GlassCard variant="default" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">
            Platform Alerts
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Issues requiring attention
          </p>
        </div>

        <span className="rounded-lg bg-rose-400/10 px-2 py-1 text-xs font-semibold text-rose-400">
          {unresolved.length} Open
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {unresolved.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-teal-400">
              No outstanding alerts
            </p>
          </div>
        ) : (
          unresolved.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <button
                key={alert.id}
                onClick={() => onOpenAlert?.(alert)}
                className="flex w-full items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.background} ${config.color}`}
                >
                  <Icon size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {alert.title}
                    </p>

                    <span className={`text-[10px] font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    {alert.description}
                  </p>

                  <p className="mt-2 text-[10px] text-white/30">
                    {alert.timestamp}
                  </p>
                </div>

                <ArrowRight
                  size={15}
                  className="mt-1 shrink-0 text-white/30"
                />
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={onViewAll}
        className="mt-4 w-full rounded-xl border border-white/[0.08] py-2.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white"
      >
        View all alerts
      </button>
    </GlassCard>
  );
}
