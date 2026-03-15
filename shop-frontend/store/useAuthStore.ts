import { create } from "zustand";
import { User, Branch, Role } from "@/types/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  tokenExpiry: null,
  isAuthenticated: false,
  branches: [],
  activeBranch: null,
  hydrated: false,

  setLogin: (user, token, expiresIn, branches, activeBranch) => {
    const expiry = expiresIn ? Date.now() + expiresIn * 1000 : null;
    set({
      user,
      accessToken: token,
      tokenExpiry: expiry,
      branches: branches ?? [],
      activeBranch: activeBranch ?? null,
      isAuthenticated: true,
    });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
  setAccessToken: (token, expiryInSeconds) => {
    const expiry = expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null;
    set({ accessToken: token, tokenExpiry: expiry, isAuthenticated: true });
  },
  setBranches: (branches) => set({ branches }),
  setActiveBranch: (branch) => set({ activeBranch: branch }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      tokenExpiry: null,
      isAuthenticated: false,
      branches: [],
      activeBranch: null,
      hydrated: false,
    }),
  checkTokenValid: () => {
    const { accessToken, tokenExpiry } = get();
    if (!accessToken) return false;
    if (!tokenExpiry) return true;
    return Date.now() < tokenExpiry;
  },
  setHydrated: (value) => set({ hydrated: value }),
}));