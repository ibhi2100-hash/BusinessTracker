"use client";


import { CartPanel } from "./cartPanel";
import { CheckoutBar } from "./checkOutBar";
import { useInventoryStore } from "@/store/inventoryStore";
import { usePOSStore } from "@/store/usePOSStore";
import { Key } from "lucide-react";
import { Keypad } from "../ui/keyPad";

export default function POSScreen() {
  const products = useInventoryStore((s) => s.products);
  const addToCart = usePOSStore((s) => s.addToCart);

  const businessId = "b1";
  const branchId = "br1";

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className="p-3 bg-black text-white">
        POS - Quick Sale
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PRODUCTS */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={products}
            onSelect={addToCart}
          />
        </div>

        {/* CART */}
        <div className="w-[300px] border-l flex flex-col">
          <CartPanel />
          <Keypad />
          <CheckoutBar
            businessId={businessId}
            branchId={branchId}
          />
        </div>
      </div>
    </div>
  );
}