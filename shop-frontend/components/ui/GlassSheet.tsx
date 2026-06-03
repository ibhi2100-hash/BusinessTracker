"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassSheetProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;

  size?: "sm" | "md" | "lg" | "full";

  loading?: boolean;

  footer?: React.ReactNode;

  className?: string;
}

export function GlassSheet({
  open,
  title,
  subtitle,
  children,
  onClose,
  footer,
  loading = false,
  size = "md",
  className,
}: GlassSheetProps) {
  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      z-[1000]
      flex
      items-end
      justify-center
      "
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!loading) onClose();
        }}
        className="
        absolute
        inset-0
        bg-black/50
        backdrop-blur-md
        "
      />

      {/* Sheet */}
      <div
        className={cn(
          `
          relative
          w-full

          rounded-t-[32px]

          border
          border-white/10

          bg-white/[0.08]

          backdrop-blur-2xl

          shadow-[0_-20px_60px_rgba(0,0,0,0.45)]

          animate-slide-up

          overflow-hidden
          `,

          size === "sm" && "max-h-[40vh]",
          size === "md" && "max-h-[65vh]",
          size === "lg" && "max-h-[85vh]",
          size === "full" && "h-[100dvh] rounded-none",

          className
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3">
          <div
            className="
            h-1.5
            w-12
            rounded-full
            bg-white/20
            "
          />
        </div>

        {/* Header */}
        <div
          className="
          flex
          items-start
          justify-between

          px-5
          py-4

          border-b
          border-white/10
          "
        >
          <div>
            {title && (
              <h2
                className="
                text-lg
                font-semibold
                text-white
                "
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                className="
                mt-1
                text-sm
                text-gray-400
                "
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            onClick={onClose}
            className="
            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-xl

            bg-white/5

            hover:bg-white/10

            disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          className="
          overflow-y-auto

          px-5
          py-5

          pb-[max(2rem,env(safe-area-inset-bottom))]
          "
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="
            border-t
            border-white/10

            p-4

            flex
            gap-3
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}