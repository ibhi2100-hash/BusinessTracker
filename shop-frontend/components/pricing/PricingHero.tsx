import { GlassCard } from "@/components/ui/GlassCard";

export function PricingHero() {
  return (
    <GlassCard
      variant="accent"
      className="
        p-8
        md:p-12
        text-center
      "
    >
      <p className="text-teal-400 text-sm font-medium">
        Pricing
      </p>

      <h1
        className="
        mt-3
        text-4xl
        md:text-6xl
        font-bold
        "
      >
        Simple pricing for
        <br />
        serious businesses
      </h1>

      <p
        className="
        mt-4
        text-gray-400
        max-w-2xl
        mx-auto
        "
      >
        Start free. Upgrade when your
        business grows.
      </p>
    </GlassCard>
  );
}