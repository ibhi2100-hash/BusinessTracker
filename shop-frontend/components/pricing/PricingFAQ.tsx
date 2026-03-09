export const PricingFAQ = () => {
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

  return (
    <section className="max-w-3xl px-6 pb-24">

      <h2 className="text-2xl font-semibold text-center mb-10">
        Frequently asked questions
      </h2>

      <div className="space-y-6">

        {faqs.map((faq) => (
          <div key={faq.q}>
            <p className="font-medium">{faq.q}</p>
            <p className="text-muted-foreground text-sm">
              {faq.a}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
};