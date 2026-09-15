"use client";
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
interface Props
  extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}
export const GlassInput = forwardRef<
  HTMLInputElement,
  Props
>(function GlassInput(
  {
    icon,
    className,
    ...props
  },
  ref
) {
  return (
    <div className="relative">
      {icon && (
        <div
          className="
            pointer-events-none
            absolute
            left-3
            top-1/2
            z-10
            -translate-y-1/2
            text-gray-400
          "
        >
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          `
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            py-3
            text-white
            outline-none
            backdrop-blur-xl
            placeholder:text-gray-500
            focus:border-teal-500
            focus:ring-2
            focus:ring-teal-500/20
          `,
          icon
            ? "pl-10"
            : "px-4",
          className
        )}
        {...props}
      />
    </div>
  );
});
GlassInput.displayName = "GlassInput";