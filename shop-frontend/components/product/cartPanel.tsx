import { useInventoryStore } from "@/store/inventoryStore";
import { usePOSStore } from "@/store/usePOSStore";

export function CartPanel() {
  const { cart, removeFromCart } = usePOSStore();

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {cart.map((item) => (
        <div
          key={item.productId}
          className="flex justify-between items-center bg-gray-100 p-3 rounded-xl"
        >
          <div>
            <div className="font-medium text-sm">
              {item.productId}
            </div>

            <div className="text-xs text-gray-500">
              ₦{item.sellingPrice / 100} × {item.quantity}
            </div>
          </div>

          <button
            onClick={() => removeFromCart(item.productId)}
            className="text-red-500 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}