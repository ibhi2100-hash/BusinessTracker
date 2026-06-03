export function StockBadge({
  quantity,
}: {
  quantity: number;
}) {
  if (quantity <= 0) {
    return (
      <div
        className="
        px-2 py-1
        rounded-full
        text-xs
        bg-red-500/10
        text-red-400
        border
        border-red-500/20
        "
      >
        Out of stock
      </div>
    );
  }

  if (quantity <= 5) {
    return (
      <div
        className="
        px-2 py-1
        rounded-full
        text-xs
        bg-amber-500/10
        text-amber-400
        border
        border-amber-500/20
        "
      >
        Low stock
      </div>
    );
  }

  return (
    <div
      className="
      px-2 py-1
      rounded-full
      text-xs
      bg-emerald-500/10
      text-emerald-400
      border
      border-emerald-500/20
      "
    >
      In stock
    </div>
  );
}