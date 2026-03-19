"use client";

import { useAppBootstrap } from "@/hooks/bootstrapHook";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
     const ready = useAppBootstrap()

   if(!ready) {
    return <div>Loading...</div>
   }

  return <>{children}</>;
}