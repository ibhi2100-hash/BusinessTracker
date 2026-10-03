// src/components/layout/AppShell.tsx

import { Outlet } from "react-router-dom";
import { AppBackground } from "./AppBackground";

export function AppShell() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black text-white">
            <AppBackground />

            <div className="relative z-10 min-h-screen">
                <Outlet />
            </div>
        </main>
    );
}