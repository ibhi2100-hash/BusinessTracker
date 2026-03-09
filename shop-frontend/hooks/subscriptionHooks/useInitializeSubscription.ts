import { useMutation } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscriptionService";

export const useInitializeSubscription = ()=> {
    return useMutation({
        mutationFn: async (planId: string)=> {
            return subscriptionService.initializePayment(planId);
        },

        onSuccess: (data)=> {
            const url = data.data.authorization_url;

            window.location.href = url;
        }
    })
}