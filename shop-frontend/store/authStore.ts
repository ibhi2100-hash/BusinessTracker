import { create } from "zustand"

const interface AuthState {
    user: {
        id: string;
        name: string;
        email: string;
        role: "ADMIN" | "USER" | string;
        businessId?: string;
        branchId?: string;
    } | null;   
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  setSession: (user, token) =>
    set({ user, accessToken: token }),

  markHydrated: () =>
    set({ isHydrated: true })
}))