import { useKeypadStore } from "@/store/keypadStore";
import { CartPanel } from "./cartPanel";
import { CheckoutBar } from "./checkOutBar";
import { useInventoryStore } from "@/store/inventoryStore";
import { usePOSStore } from "@/store/usePOSStore";
import { ProductGrid } from "./productGrid";
import { Keypad } from "../ui/keyPad";



export default function POSScreen() {
  const products = useInventoryStore((s) => s.products);
  const addToCart = usePOSStore((s) => s.addToCart);
  const activeProductId = useKeypadStore((s) => s.activeProductId);

  const businessId = "b1";
  const branchId = "br1";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <div className="p-3 bg-black text-white flex justify-between">
        <span>POS</span>
        <span className="text-sm opacity-70">Quick Sale</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PRODUCTS */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={products}
            onSelect={addToCart}
          />
        </div>

        {/* CART PANEL */}
        <div className="w-[340px] border-l flex flex-col bg-white">
          <CartPanel />
          <CheckoutBar
            businessId={businessId}
            branchId={branchId}
          />
        </div>
      </div>

      {/* 🔥 FLOATING KEYPAD (ONLY WHEN ACTIVE) */}
      {activeProductId && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 shadow-2xl">
          <Keypad />
        </div>
      )}
    </div>
  );
}