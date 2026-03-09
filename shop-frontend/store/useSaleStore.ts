import { create } from "zustand";

export const useSaleStore = create((set)=> ({
    sales: [],

    addSale: (sale)=> 
        set((state)=> ({
            sales: [...state.sales, sale]
        }))
}))