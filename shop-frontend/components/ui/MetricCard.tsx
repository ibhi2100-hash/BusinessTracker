
import { GlassCard } from "./GlassCard";
import { GlassIcon } from "./GlassIcon";

interface MetricCardProps {
  title: string;

  value: string;

  trend?: string;

  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
}: MetricCardProps) {
  return (
    <GlassCard
      variant="accent"
      className="p-5"
    >
      <div
        className="
        flex
        items-start
        justify-between
        "
      >
        <div>
          <p
            className="
            text-sm
            text-gray-400
            "
          >
            {title}
          </p>

          <h3
            className="
            mt-2
            text-3xl
            font-bold
            "
          >
            {value}
          </h3>

          {trend && (
            <p
              className="
              mt-2
              text-xs
              text-emerald-400
              "
            >
              {trend}
            </p>
          )}
        </div>

        {icon && (
          <GlassIcon>
            {icon}
          </GlassIcon>
        )}
      </div>
    </GlassCard>
  );
}