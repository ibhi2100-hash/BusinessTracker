import { dashboardReducer } from "@/offline/events/eventReducer";
import { create } from "zustand";
export const useDashboardStore = create((set)=> ({
    snapshot: null,
    events: [],
    dashboard: {
        cashAtHand: 0,
        inventoryValue: 0,
        todaySales: 0,
        profit: 0,
    },

    initialize(snapshot, events){
        const state = computeDashboard(snapshot, events)

        set({
            snapshot,
            events,
            dashboard: state
        })
    },
    applyEvent(event: any) {
        set((state)=>({
            events: [...state.events, event],
            dashboard: dashboardReducer(state.dashboard, event)
        }))
    }
}))