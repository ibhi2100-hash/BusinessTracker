import { usePOSStore } from "@/store/usePOSStore";

export function CheckoutBar({
  businessId,
  branchId,
}: {
  businessId: string;
  branchId: string;
}) {
  const { cart, checkout } = usePOSStore();

  const total = cart.reduce(
    (sum, i) => sum + i.sellingPrice * i.quantity,
    0
  );

  return (
    <div className="p-4 border-t bg-white sticky bottom-0">
      <div className="flex justify-between mb-2">
        <span>Total</span>
        <span className="font-bold">
          ₦{total / 100}
        </span>
      </div>

      <button
        onClick={() => checkout(businessId, branchId)}
        className="w-full bg-green-600 text-white py-3 rounded-xl text-lg active:scale-95"
      >
        Checkout
      </button>
    </div>
  );
}