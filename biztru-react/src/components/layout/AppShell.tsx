// src/components/layout/AppShell.tsx

import { Outlet } from "react-router-dom";

import { AppBackground } from "./AppBackground";

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* ---------------------------------------------------------- */}
      {/* Global application background                               */}
      {/* ---------------------------------------------------------- */}

      <AppBackground />

      {/* ---------------------------------------------------------- */}
      {/* Application content                                         */}
      {/* ---------------------------------------------------------- */}

      <div className="relative z-10 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}