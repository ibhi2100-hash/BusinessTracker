import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Branch } from "@/types/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  tokenExpiry: number | null;
  branches: Branch[];
  activeBranch: Branch | null;
  hydrated: boolean;

  setLogin: (
    user: User,
    token: string,
    expiresIn?: number,
    branches?: Branch[],
    activeBranch?: Branch
  ) => void;

  setHydrated: (value: boolean) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string, expiryInSeconds?: number) => void;
  setBranches: (branches: Branch[]) => void;
  setActiveBranch: (branch: Branch) => void;
  logout: () => void;
  checkTokenValid: () => boolean;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      tokenExpiry: null,
      branches: [],
      activeBranch: null,
      hydrated: false,

      setLogin: (user, token, expiresIn, branches, activeBranch) => {
        const expiry = expiresIn
          ? Date.now() + expiresIn * 1000
          : null;

        set({
          user,
          accessToken: token,
          tokenExpiry: expiry,
          branches: branches ?? [],
          activeBranch: activeBranch ?? null,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setAccessToken: (token, expiryInSeconds) => {
        const expiry = expiryInSeconds
          ? Date.now() + expiryInSeconds * 1000
          : null;

        set({
          accessToken: token,
          tokenExpiry: expiry,
        });
      },

      setBranches: (branches) => {
        set({ branches });
      },

      setActiveBranch: (branch) => {
        set({ activeBranch: branch });
      },

      clear: () => {
        set({
          user: null,
          accessToken: null,
          tokenExpiry: null,
          branches: [],
          activeBranch: null,
        });
      },

      logout: () => {
        get().clear();
      },

      checkTokenValid: () => {
        const { accessToken, tokenExpiry } = get();

        if (!accessToken) return false;
        if (!tokenExpiry) return false;

        return Date.now() < tokenExpiry;
      },

      setHydrated: (value) => {
        set({ hydrated: value });
      },
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        tokenExpiry: state.tokenExpiry,
        branches: state.branches,
        activeBranch: state.activeBranch,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);