import { create } from "zustand";

interface SubscritionState {
    subscription: any | null;

    setSubscription: (data: any)=> void;
}

export const useSubscriptionStore = create<SubscritionState>((set)=> ({
    subscription: null,

    setSubscription: (data)=>set({
        subscription: data
    })
}))