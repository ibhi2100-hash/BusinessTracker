// src/components/layout/AppBackground.tsx

export function AppBackground() {
  return (
    <div className="absolute inset-0">
      {/* Primary Glow */}
      <div
        className="
        absolute
        -top-30
        left-1/2
        -translate-x-1/2
        h-105
        w-105
        rounded-full
        bg-teal-500/20
        blur-[120px]
      "
      />

      {/* Secondary Glow */}
      <div
        className="
        absolute
        -botton-30
        -right-20
        h-80
        w-[320px]
        rounded-full
        bg-cyan-500/20
        blur-[120px]
      "
      />

      {/* Grid */}
      <div
        className="
        absolute
        inset-0
        opacity-[0.04]
        bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
        bg-size-[50px_50px]
      "
      />
    </div>
  );
}