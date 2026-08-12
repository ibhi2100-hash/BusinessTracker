// components/RoutePersistence.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

export function RoutePersistence() {
  const pathname = usePathname();
  const app = useApplication();

  useEffect(() => {
   
    // Persist to client database
    app.client.repositories.applicationState
      .setLastRoute(pathname)
      .catch(console.error);

  }, [pathname, app]);

  return null;
}