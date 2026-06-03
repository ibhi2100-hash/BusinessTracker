import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;

  size?: "sm" | "md" | "lg";

  variant?: "primary" | "success" | "danger";
}

export function GlassIcon({
  children,
  size = "md",
  variant = "primary",
}: Props) {
  return (
    <div
      className={cn(
        `
        flex
        items-center
        justify-center
        rounded-2xl
        `,

        size === "sm" && "h-10 w-10",

        size === "md" && "h-12 w-12",

        size === "lg" && "h-14 w-14",

        variant === "primary" &&
          `
          bg-teal-500/10
          text-teal-400
          `,

        variant === "success" &&
          `
          bg-emerald-500/10
          text-emerald-400
          `,

        variant === "danger" &&
          `
          bg-red-500/10
          text-red-400
          `
      )}
    >
      {children}
    </div>
  );
}