"use client";

import {
  ButtonHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "destructive"
  | "danger"
  | "ghost"
  | "success";

type Size = "sm" | "md" | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth,
      loading = false,
      disabled,
      children,
      type,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none touch-manipulation";

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm", // mobile-friendly default
      lg: "h-12 px-6 text-base",
    };

    const variants = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",

      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",

      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

      ghost:
        "bg-transparent hover:bg-white/10 text-gray-200 focus:ring-gray-400",

      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    };

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled || loading}
        className={cn(
          base,
          sizes[size],
          variants[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";