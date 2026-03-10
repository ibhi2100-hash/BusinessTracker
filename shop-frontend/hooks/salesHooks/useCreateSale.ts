import { useMutation } from "@tanstack/react-query";

export function useCreateSale(){
    return useMutation({
        mutationFn: async (sale)=> {
             await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sale/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(sale)
             })
        }
    })
}