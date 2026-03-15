"use client"
import { ProductSearch } from "@/components/sales/ProductSearch";
import { CartPanel } from "@/components/sales/CartPanel";
import { PaymentSection } from "@/components/sales/PaymentSection";
import { useMutation } from "@tanstack/react-query";
import { addToQueue } from "@/lib/offlineQueue";
import { apiClient } from "@/lib/api-client";


export default function SalesPage() {

  const mutation = useMutation({
    mutationFn: async (saleData) => {
      if(!navigator.onLine) {
        await addToQueue(saleData);
        return { offline: true}
      }

      return apiClient.post("/sales", saleData)
    },
  });
  
  return (
    <div className="space-y-4">
      <ProductSearch />
      <CartPanel />
      <PaymentSection />
    </div>
  );
}
