// components/reports/BarSeries.tsx
"use client";

import { cn } from "@/lib/utils";

interface BarItem {
  label: string;
  value: number;
  secondary?: number;
}

interface Props {
  data: BarItem[];
  valueLabel?: string;
  secondaryLabel?: string;
  className?: string;
}

export function BarSeries({
  data,
  valueLabel = "Revenue",
  secondaryLabel = "Profit",
  className,
}: Props) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary ?? 0)), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{d.label}</span>
            <span className="text-emerald-400 font-medium">
              ₦{d.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500/70 transition-all"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          {d.secondary != null && (
            <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500/50"
                style={{ width: `${(d.secondary / max) * 100}%` }}
              />
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-4 text-[10px] text-gray-500 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500/70" />
          {valueLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
          {secondaryLabel}
        </span>
      </div>
    </div>
  );
}