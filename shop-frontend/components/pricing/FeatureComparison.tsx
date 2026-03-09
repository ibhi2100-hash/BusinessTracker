import { Card } from "@/components/ui/card";

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

export const FeatureComparison = () => {
  return (
    <section className="w-full max-w-5xl px-6 pb-24">

      <Card className="p-8">

        <h2 className="text-xl font-semibold mb-6">
          Compare plans
        </h2>

        <div className="space-y-4">

          {features.map((f) => (
            <div
              key={f.name}
              className="grid grid-cols-4 text-sm"
            >
              <div className="font-medium">{f.name}</div>
              <div>{f.starter}</div>
              <div>{f.growth}</div>
              <div>{f.enterprise}</div>
            </div>
          ))}

        </div>

      </Card>

    </section>
  );
};