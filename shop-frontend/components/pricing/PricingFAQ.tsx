  import { GlassCard } from "@/components/ui/GlassCard";

  
  const faqs = [
    {
      q: "Can I start for free?",
      a: "Yes. You can start using the starter plan without paying."
    },
    {
      q: "Can I upgrade later?",
      a: "Yes. You can upgrade anytime as your business grows."
    },
    {
      q: "Do you support multiple branches?",
      a: "Yes. Growth and Enterprise plans support multiple branches."
    }
  ];



export function PricingFAQ() {
  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <GlassCard
          key={faq.q}
          className="p-5"
        >
          <h3 className="font-semibold">
            {faq.q}
          </h3>

          <p
            className="
            mt-2
            text-sm
            text-gray-400
            "
          >
            {faq.a}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}