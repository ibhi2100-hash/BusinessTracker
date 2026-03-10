import { useMutation } from "@tanstack/react-query";
import { dispatchEvent } from "@/offline/events/eventDispatcher";
import { EventTypes } from "@/offline/events/eventTypes";

export function useCreateSale(){
    return useMutation({
        mutationFn: async (sale: { amount: number; costPrice: number })=> {
            if(!navigator.onLine) {
                await dispatchEvent(
                    EventTypes.SALE_ADDED, {
                        amount: sale.amount,
                        cost: sale.costPrice
                    }
                )
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