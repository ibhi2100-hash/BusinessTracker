import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardContentProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: string;
  size?: "default" | "financial";
  className?: string;
}

export const CardContent = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  size = "default",
  className,
}: CardContentProps) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-semibold">
          {title}
        </p>

        {icon && (
          <div className="p-2 bg-white/30 rounded-full">
            {icon}
          </div>
        )}
      </div>

      <div
        className={cn(
          "font-bold text-gray-800",
          size === "default" && "text-2xl",
          size === "financial" && "text-3xl"
        )}
      >
        {value}
      </div>

      {subtitle && (
        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      )}

      {trend && (
        <p className="text-xs font-medium text-green-600">
          {trend}
        </p>
      )}
    </div>
  );
};