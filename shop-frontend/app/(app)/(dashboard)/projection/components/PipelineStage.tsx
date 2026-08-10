import { cn } from "@/lib/utils";
import { GlassIcon } from "@/components/ui/GlassIcon";

interface PipelineStageProps {
  icon: React.ReactNode;
  label: string;
  state: "idle" | "active" | "complete" | "failed";
  detail?: string;
}

export function PipelineStage({
  icon,
  label,
  state,
  detail,
}: PipelineStageProps) {

  return (
    <div
      className={cn(
        `
        flex
        min-w-[130px]
        flex-1
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        px-4
        py-5
        transition-all
        duration-300
        `,
        
        state === "idle" &&
          "border-white/10 bg-white/[0.03]",

        state === "active" &&
          "border-teal-500/40 bg-teal-500/10",

        state === "complete" &&
          "border-emerald-500/30 bg-emerald-500/10",

        state === "failed" &&
          "border-red-500/30 bg-red-500/10"
      )}
    >

      <GlassIcon
        size="sm"
        variant={
          state === "failed"
            ? "danger"
            : state === "complete"
              ? "success"
              : "primary"
        }
      >
        {icon}
      </GlassIcon>

      <span className="mt-3 text-sm font-medium text-white">
        {label}
      </span>

      {detail && (
        <span className="mt-1 text-xs text-gray-500">
          {detail}
        </span>
      )}

    </div>
  );
}