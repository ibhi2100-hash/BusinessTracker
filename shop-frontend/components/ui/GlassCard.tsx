import { cn } from "@/lib/utils";
import { tokens } from "../themes/tokens";

interface Props {
  children: React.ReactNode;
  className?: string;

  variant?: "default" | "elevated" | "accent";
}

export function GlassCard({
  children,
  className,
  variant = "default",
}: Props) {
  return (
    <div
      className={cn(
        `
        ${tokens.radius.lg}
        ${tokens.blur.lg}
        border
        transition-all
        duration-300
        `,

        variant === "default" &&
          `
          ${tokens.surface.default}
        `,

        variant === "elevated" &&
          `
          ${tokens.surface.elevated}
        `,

        variant === "accent" &&
          `
          ${tokens.surface.accent}
          `,

        className
      )}
    >
      {children}
    </div>
  );
}