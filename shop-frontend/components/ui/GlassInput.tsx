import { cn } from "@/lib/utils";

interface Props
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function GlassInput({
  icon,
  className,
  ...props
}: Props) {
  return (
    <div className="relative">
      {icon && (
        <div
          className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-gray-400
          "
        >
          {icon}
        </div>
      )}

      <input
        className={cn(
          `
          w-full

          rounded-2xl

          border
          border-white/10

          bg-white/[0.04]

          backdrop-blur-xl

          py-3

          outline-none

          text-white

          placeholder:text-gray-500

          focus:border-teal-500
          focus:ring-2
          focus:ring-teal-500/20
          `,

          icon ? "pl-10" : "px-4",

          className
        )}
        {...props}
      />
    </div>
  );
}