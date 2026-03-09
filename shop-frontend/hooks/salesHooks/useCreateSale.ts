import { useMutation } from "@tanstack/react-query";
import { saveSaleOffline } from "@/services/saleService";

export function useCreateSale(){
    return useMutation({
        mutationFn: async (sale)=> {
            if(!navigator.onLine) {
                await saveSaleOffline(sale)
                return
            }
             await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sale/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(sale)
             })
        }
    })
}