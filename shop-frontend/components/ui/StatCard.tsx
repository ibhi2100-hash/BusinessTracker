import { GlassCard } from "./GlassCard";

interface StatCardProps {
  value: string | number;

  label: string;

  icon?: React.ReactNode;
}

export function StatCard({
  value,
  label,
  icon,
}: StatCardProps) {
  return (
    <GlassCard className="p-5">
      {icon && (
        <div className="mb-3">
          {icon}
        </div>
      )}

      <div
        className="
        text-2xl
        font-bold
        "
      >
        {value}
      </div>

      <p
        className="
        mt-1
        text-sm
        text-gray-400
        "
      >
        {label}
      </p>
    </GlassCard>
  );
}