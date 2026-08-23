// components/reports/DeltaBadge.tsx
"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDelta, pctChange } from "./reportFormat";

export function DeltaBadge({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  const delta = current - previous;
  const pct = pctChange(current, previous);
  const up = delta > 0;
  const flat = delta === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        flat && "text-gray-400",
        up && "text-emerald-400",
        !up && !flat && "text-red-400"
      )}
    >
      {flat ? (
        <Minus className="w-3 h-3" />
      ) : up ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {formatDelta(delta)} ({pct.toFixed(0)}%)
    </span>
  );
}