
import { RefreshCw, Download, CalendarDays } from "lucide-react";
import { GlassButton } from "../../../../components/ui/GlassButton"; 

interface DashboardHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function DashboardHeader({
  onRefresh,
  onExport,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">
            Platform Control
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Founder Dashboard
        </h1>

        <p className="mt-1 text-sm text-white/50">
          Your global overview of the BizTru ecosystem.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/70">
          <CalendarDays size={16} />
          <span>November 2026</span>
        </div>

        <GlassButton
          variant="secondary"
          onClick={onRefresh}
        >
          <RefreshCw size={15} />
          Refresh
        </GlassButton>

        <GlassButton
          variant="primary"
          onClick={onExport}
        >
          <Download size={15} />
          Export
        </GlassButton>
      </div>
    </div>
  );
}
