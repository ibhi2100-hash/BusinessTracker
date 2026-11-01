
import type { ChangeEvent } from "react";

import { GlassInput } from "../../ui/GlassInput";

export type StockInputAccent = "blue" | "amber" | "emerald";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accent?: StockInputAccent;
  prefix?: string;
  placeholder?: string;
  helper?: string;
  disabled?: boolean;
  ariaLabel: string;
}

const ACCENT_STYLES: Record<
  StockInputAccent,
  {
    border: string;
    focus: string;
    glow: string;
    line: string;
    text: string;
  }
> = {
  blue: {
    border: "border-blue-400/20",
    focus: "focus-within:border-blue-400/50",
    glow: "focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.10),0_20px_70px_rgba(59,130,246,0.10)]",
    line: "bg-blue-300/30",
    text: "text-blue-300",
  },

  amber: {
    border: "border-amber-400/20",
    focus: "focus-within:border-amber-400/50",
    glow: "focus-within:shadow-[0_0_0_1px_rgba(245,158,11,0.10),0_20px_70px_rgba(245,158,11,0.10)]",
    line: "bg-amber-300/30",
    text: "text-amber-300",
  },

  emerald: {
    border: "border-emerald-400/25",
    focus: "focus-within:border-emerald-400/60",
    glow: "focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.13),0_24px_80px_rgba(16,185,129,0.12)]",
    line: "bg-emerald-300/40",
    text: "text-emerald-300",
  },
};

export function formatStockNumber(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const raw = String(value).replace(/,/g, "");

  if (!/^\d+$/.test(raw)) {
    return "";
  }

  return Number(raw).toLocaleString("en-NG");
}

export function parseStockNumber(value: string): number {
  const raw = value.replace(/,/g, "");

  if (!raw) return 0;

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function sanitizeStockNumber(value: string): string {
  return value.replace(/,/g, "").replace(/\D/g, "");
}

export function isValidStockQuantity(value: number): boolean {
  return (
    Number.isSafeInteger(value) &&
    value > 0
  );
}

export function StockSheetNumberField({
  label,
  value,
  onChange,
  accent = "blue",
  prefix = "#",
  placeholder = "0",
  helper,
  disabled = false,
  ariaLabel,
}: Props) {
  const styles = ACCENT_STYLES[accent];

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    onChange(sanitizeStockNumber(event.target.value));
  };

  const formattedValue = formatStockNumber(value);

  return (
    <section className="space-y-2">
      <label className="
        mb-2
        block
        text-xs
        font-medium
        uppercase
        tracking-wider
        text-gray-500
      ">
        {label}
      </label>

      <div
        className={`
          relative
          overflow-hidden
          rounded-[26px]
          border
          ${styles.border}
          bg-black/20
          shadow-inner
          shadow-linear
          transition-all
          duration-200
          ${styles.focus}
          ${styles.glow}
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <div
          className={`
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            ${styles.line}
          `}
        />

        <span
          className={`
            absolute
            left-5
            top-1/2
            z-10
            -translate-y-1/2
            text-2xl
            font-medium
            sm:text-3xl
            ${styles.text}
          `}
        >
          {prefix}
        </span>

        <GlassInput
          value={formattedValue}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-label={ariaLabel}
          className="
            h-24
            w-full
            border-0
            bg-transparent
            pl-14
            pr-5
            text-right
            text-4xl
            font-bold
            leading-none
            tracking-[-0.04em]
            text-white
            shadow-none
            outline-none
            placeholder:text-gray-700
            focus:border-0
            focus:ring-0
            sm:h-28
            sm:pl-16
            sm:pr-6
            sm:text-5xl
          "
        />
      </div>

      <div className="
        mt-2
        flex
        min-h-5
        items-center
        justify-between
        px-1
      ">
        <p className="text-[11px] text-gray-600">
          {helper ?? ""}
        </p>

        {formattedValue && (
          <p className={`text-[11px] font-medium ${styles.text} opacity-70`}>
            {prefix === "#" ? "" : prefix}
            {formattedValue}
          </p>
        )}
      </div>
    </section>
  );
}
