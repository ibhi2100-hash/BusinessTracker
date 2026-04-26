  "use client";

import { useEffect } from "react";
import { startBusinessSubscriber, stopBusinessSubscriber } from "@/offline/subscribers/businessSubscriber";
import { startInventorySubscriber, stopInventorySubscriber } from "@/offline/subscribers/inventorySubscriber";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) return;

    // 🔥 START ALL CORE SUBSCRIBERS ONCE USER EXISTS
    startBusinessSubscriber();
    startInventorySubscriber();

    return () => {
      stopBusinessSubscriber();
      stopInventorySubscriber();
    };
  }, [user?.id]);

  return children;
}