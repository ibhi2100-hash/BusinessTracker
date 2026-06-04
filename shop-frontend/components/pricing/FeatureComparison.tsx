import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    name: "Branches",
    starter: "1",
    growth: "10",
    enterprise: "Unlimited"
  },
  {
    name: "Inventory",
    starter: "✓",
    growth: "✓",
    enterprise: "✓"
  },
  {
    name: "Financial Reports",
    starter: "Basic",
    growth: "Advanced",
    enterprise: "Advanced"
  },
  {
    name: "API Access",
    starter: "—",
    growth: "—",
    enterprise: "✓"
  }
];


export function FeatureComparison() {
  return (
    <GlassCard className="p-6">
      <h2
        className="
        text-xl
        font-semibold
        mb-6
        "
      >
        Compare Plans
      </h2>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Feature</th>
              <th>Starter</th>
              <th>Growth</th>
              <th>Enterprise</th>
            </tr>
          </thead>

          <tbody>
            {features.map((feature) => (
              <tr
                key={feature.name}
                className="
                border-t
                border-white/5
                "
              >
                <td className="py-4">
                  {feature.name}
                </td>

                <td>{feature.starter}</td>
                <td>{feature.growth}</td>
                <td>{feature.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}