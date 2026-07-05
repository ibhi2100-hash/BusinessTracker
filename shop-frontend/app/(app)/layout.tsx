  "use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { runSync } from "@/lib/syncMonitor";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async()=> {
      await runSync()
    })()
    if (!user?.id) return;
  
  }, [user?.id]);

  return children;
}