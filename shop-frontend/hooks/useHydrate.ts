"use client";
import { useBusinessStore } from "@/store/businessStore";

export function useHydrated() {
  return useBusinessStore((s) => s.hydrated);
}