
import { useMutation } from "@tanstack/react-query";

export const useVerifyPayment = ()=> {
    return useMutation({
        mutationFn: async (reference: string)=> {
            return "";
        }
    })
}