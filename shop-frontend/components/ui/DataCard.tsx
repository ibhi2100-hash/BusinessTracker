
import { cn } from "@/lib/utils";
import { GlassCard } from "../ui/GlassCard";


type DataCardVariant =
  | "inventory"
  | "finance"
  | "person"
  | "asset"
  | "generic";

interface DataCardProps {
  title: string;
  subtitle?: string;

  image?: string;

  badge?: React.ReactNode;

  metrics?: {
    label: string;
    value: string | number;
  }[];

  actions?: React.ReactNode;

  footer?: React.ReactNode;

  selected?: boolean;
  disabled?: boolean;

  variant?: "inventory" | "finance" | "person" | "asset" | "generic";

  onClick?: () => void;
}

export function DataCard({
  title,
  subtitle,
  image,
  badge,
  metrics,
  actions,
  footer,
  onClick,
  selected,
  disabled
}: DataCardProps) {
  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
      <GlassCard
        className={cn(
          `
        p-4
        hover:bg-white/[0.08]
        transition-all
        duration-200
        active:scale-[0.97]
        hover: bg-white/[0.08]
        `,
        selected && 
                `
                border-teal-500/30
                shadow-[0_0_40px_rgba(20,184,166,0.15)]
                `,
        disabled && "opacity-60 pointer-events-none"
        )}
      >
      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3">
          {image && (
            <img
              src={image}
              className="
              w-12
              h-12
              rounded-2xl
              object-cover
              border
              border-white/10
              "
            />
          )}

          <div>
            <h3 className="font-semibold text-white">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {badge && <div>{badge}</div>}
      </div>

      {/* METRICS */}
      {metrics && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="
              bg-white/[0.03]
              border
              border-white/10
              rounded-xl
              p-2
              "
            >
              <p className="text-[10px] text-gray-400">
                {m.label}
              </p>
              <p className="text-sm font-semibold">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      {actions && (
        <div className="mt-4 flex gap-2">
          {actions}
        </div>
      )}

      {/* FOOTER */}
      {footer && (
        <div className="mt-4 text-xs text-gray-400">
          {footer}
        </div>
      )}
    </GlassCard>
    </div>
  );
}