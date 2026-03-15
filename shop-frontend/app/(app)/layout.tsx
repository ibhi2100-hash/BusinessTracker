"use client";

import { useAppBootstrap } from "@/hooks/bootstrapHook";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAppBootstrap();

  return <>{children}</>;
}