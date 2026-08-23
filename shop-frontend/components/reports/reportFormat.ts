// components/reports/reportFormat.ts
export function formatNaira(n: number) {
  return `₦${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatDelta(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatNaira(n)}`;
}

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}