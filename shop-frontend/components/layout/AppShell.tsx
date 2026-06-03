// src/components/layout/AppShell.tsx

import { AppBackground } from "./AppBackground";

interface Props {
  children: React.ReactNode;
}

export function AppShell({
  children,
}: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AppBackground />

      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </main>
  );
}