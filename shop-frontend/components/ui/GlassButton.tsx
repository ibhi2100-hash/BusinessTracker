import { cn } from "@/lib/utils";
import { tokens } from "../themes/tokens";

interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "danger"
    | "success";

  icon?: React.ReactNode;
}


export function GlassButton({
  className,
  variant = "primary",
  icon,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        `
        inline-flex
        items-center
        justify-center
        gap-2

        px-4
        py-3

        ${tokens.radius.md}

        transition-all
        duration-200

        active:scale-[0.98]
        disabled:opacity-50
        disabled:pointer-events-none
        `,

        variant === "primary" &&
          `${tokens.variant.primary}`,

        variant === "secondary" &&
          `${tokens.variant.secondary}`,

        variant === "tertiary" &&
          `${tokens.variant.tertiary}`,

        variant === "danger" &&
          `${tokens.variant.danger}`,

        variant === "success" &&
          `${tokens.variant.success}`,

        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}