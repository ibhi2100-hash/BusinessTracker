"use client";

export function FinancialCarousel() {
  const cards = [
    {
      title: "Today's Sales",
      value: "₦185,000",
      change: "+12% vs yesterday",
    },
    {
      title: "Cash at Hand",
      value: "₦120,000",
      change: "Updated just now",
    },
    {
      title: "Inventory Value",
      value: "₦3.4M",
      change: "Across all products",
    },
    {
      title: "Outstanding Debts",
      value: "₦420,000",
      change: "3 active liabilities",
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory">
      {cards.map((card, i) => (
        <div
          key={i}
          className="min-w-[250px] snap-start bg-white p-4 rounded-2xl shadow"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <h2 className="text-2xl font-bold mt-2">{card.value}</h2>
          <p className="text-xs text-green-600 mt-1">{card.change}</p>
        </div>
      ))}
    </div>
  );
}
