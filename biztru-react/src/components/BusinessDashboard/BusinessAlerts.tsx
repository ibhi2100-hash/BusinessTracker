
import {
  AlertTriangle,
  ArrowUpRight,
  CloudOff,
  Package,
  ReceiptText,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";

type AlertSeverity = "critical" | "warning" | "info";

interface BusinessAlert {
  id: string;
  title: string;
  description: string;
  branch: string;
  severity: AlertSeverity;
  icon: React.ReactNode;
  time: string;
}

interface BusinessAlertsProps {
  onAlertClick?: (alert: BusinessAlert) => void;
}

const alerts: BusinessAlert[] = [
  {
    id: "alert-001",
    title: "Branch requires attention",
    description: "Branch operational status needs review.",
    branch: "Kubwa Branch",
    severity: "warning",
    icon: <AlertTriangle size={19} />,
    time: "10 minutes ago",
  },
  {
    id: "alert-002",
    title: "Low stock detected",
    description: "Several products are approaching their reorder levels.",
    branch: "Wuse Branch",
    severity: "warning",
    icon: <Package size={19} />,
    time: "25 minutes ago",
  },
  {
    id: "alert-003",
    title: "Synchronization delayed",
    description: "Latest branch records have not synchronized.",
    branch: "Garki Branch",
    severity: "critical",
    icon: <CloudOff size={19} />,
    time: "40 minutes ago",
  },
  {
    id: "alert-004",
    title: "Expense requires review",
    description: "An expense entry has been flagged for review.",
    branch: "Maitama Branch",
    severity: "info",
    icon: <ReceiptText size={19} />,
    time: "1 hour ago",
  },
];

const severityStyles = {
  critical: {
    icon: "danger",
    badge: "bg-red-500/15 text-red-400",
    label: "Critical",
  },
  warning: {
    icon: "primary",
    badge: "bg-amber-500/15 text-amber-400",
    label: "Warning",
  },
  info: {
    icon: "success",
    badge: "bg-blue-500/15 text-blue-400",
    label: "Review",
  },
} as const;

export function BusinessAlerts({
  onAlertClick,
}: BusinessAlertsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            Business Alerts
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Issues across your branches
          </p>
        </div>

        <span className="text-xs text-amber-400">
          {alerts.length} alerts
        </span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const style = severityStyles[alert.severity];

          return (
            <button
              key={alert.id}
              type="button"
              onClick={() => onAlertClick?.(alert)}
              className="w-full text-left"
            >
              <GlassCard className="p-3 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-start gap-3">
                  <GlassIcon
                    size="md"
                    variant={style.icon}
                  >
                    {alert.icon}
                  </GlassIcon>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">
                        {alert.title}
                      </p>

                      <span
                        className={`text-[10px] px-2 py-1 rounded-full shrink-0 ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    </div>

                    <p className="text-xs text-white/50 mt-1">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-3">
                      <p className="text-xs text-white/60">
                        {alert.branch}
                      </p>

                      <p className="text-[10px] text-white/40">
                        {alert.time}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-white/30 shrink-0 mt-1"
                  />
                </div>
              </GlassCard>
            </button>
          );
        })}
      </div>
    </section>
  );
}
