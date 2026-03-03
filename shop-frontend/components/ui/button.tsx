"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md focus:ring-indigo-500",

      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",

      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500",

      ghost:
        "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300",

      // 🔥 Financial Heavy Success Variant
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md focus:ring-emerald-500",
    };

    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          fullWidth && "w-full",
          "h-10 px-4",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";