import { GlassCard } from "./GlassCard";
import { GlassIcon } from "./GlassIcon";

interface ActionTileProps {
  icon: React.ReactNode;

  label: string;

  onClick: () => void;
}

export function ActionTile({
  icon,
  label,
  onClick,
}: ActionTileProps) {
  return (
    <button
      onClick={onClick}
      className="w-full"
    >
      <GlassCard
        className="
        p-4

        flex
        flex-col

        items-center

        gap-3

        hover:bg-white/[0.08]
        "
      >
        <GlassIcon>
          {icon}
        </GlassIcon>

        <span
          className="
          text-sm
          text-center
          "
        >
          {label}
        </span>
      </GlassCard>
    </button>
  );
}