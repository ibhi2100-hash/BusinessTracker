import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
  gradient?: string;
}

export const Card = ({
  children,
  className,
  variant = "default",
  gradient,
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-3xl p-5 shadow-lg transition-all duration-300",
        variant === "default" &&
          "bg-white border border-gray-100 shadow-sm",
        variant === "gradient" &&
          `bg-gradient-to-br ${gradient}`,
        className
      )}
    >
      {children}
    </div>
  );
};