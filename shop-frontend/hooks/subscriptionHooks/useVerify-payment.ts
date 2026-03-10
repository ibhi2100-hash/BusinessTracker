import { subscriptionService } from "@/services/subscriptionService";
import { useMutation } from "@tanstack/react-query";

export const useVerifyPayment = ()=> {
    return useMutation({
        mutationFn: async (reference: string)=> {
            return subscriptionService.verifyPayment(reference);
        }
    })
}