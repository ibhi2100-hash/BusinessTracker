import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  value?: number;

  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
  gradient?: string;
}

export const Card = ({
  title,
  value,
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
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      {value !== undefined && (
        <p className="text-2xl font-bold">${value.toFixed(2)}</p>
      )}
      {children}
    </div>
  );
};