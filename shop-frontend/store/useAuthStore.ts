import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Branch {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | string;
  businessId?: string;
  branchId?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;

  branches: Branch[];
  activeBranch: Branch | null;

  setLogin: (
    user: User,
    token: string,
    expiresIn?: number,
    branches?: Branch[],
    activeBranch?: Branch
  ) => void;

  setUser: (user: User) => void;
  setAccessToken: (token: string, expiryInSeconds?: number) => void;
  setBranches: (branches: Branch[]) => void;
  setActiveBranch: (branch: Branch) => void;

  logout: () => void;
  checkTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      tokenExpiry: null,
      isAuthenticated: false,
      branches: [],
      activeBranch: null,

      // ✅ Unified login method
      setLogin: (user, token, expiresIn, branches, activeBranch) =>
        set({
          user,
          accessToken: token,
          tokenExpiry: expiresIn ? Date.now() + expiresIn * 1000 : null,
          branches: branches || [],
          activeBranch: activeBranch || null,
          isAuthenticated: true,
        }),

      setUser: (user: User) => set({ user, isAuthenticated: true }),

      setAccessToken: (token: string, expiryInSeconds?: number) => {
        const expiry = expiryInSeconds
          ? Date.now() + expiryInSeconds * 1000
          : null;
        set({ accessToken: token, tokenExpiry: expiry, isAuthenticated: true });
      },

      setBranches: (branches: Branch[]) => set({ branches }),
      setActiveBranch: (branch: Branch) => set({ activeBranch: branch }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          tokenExpiry: null,
          isAuthenticated: false,
          branches: [],
          activeBranch: null,
        }),

      checkTokenValid: () => {
        const { accessToken, tokenExpiry } = get();
        if (!accessToken) return false;
        if (!tokenExpiry) return true;
        return Date.now() < tokenExpiry;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);