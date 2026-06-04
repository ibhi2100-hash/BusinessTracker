import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

export function PricingCTA() {
  return (
    <GlassCard
      variant="accent"
      className="
        p-10
        text-center
      "
    >
      <h2
        className="
        text-3xl
        font-bold
        "
      >
        Ready to scale your business?
      </h2>

      <p
        className="
        mt-3
        text-gray-400
        "
      >
        Join thousands of businesses
        managing inventory, cashflow,
        branches and sales in one place.
      </p>

      <GlassButton
        className="
        mt-8
        px-8
        "
      >
        Start Free
      </GlassButton>
    </GlassCard>
  );
}