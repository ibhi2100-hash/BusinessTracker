// app/onboard/layout.tsx

"use client";

import { ReactNode } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-black relative">

      {/* BACKGROUND LIGHTS */}
      <div className="absolute inset-0">

        <div className="absolute top-[-200px] left-[-100px] w-[400px] h-[400px] bg-white/10 blur-3xl rounded-full" />

        <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]" />
      </div>

      {/* CONTENT */}
      <main className="relative z-10 flex justify-center min-h-screen px-4">
        <div className="w-full max-w-[430px]">
          {children}
        </div>
      </main>
    </div>
  );
}