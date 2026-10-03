import { Outlet } from "react-router-dom";
import AppNav from "../navigation/BottomNav"

export function DashboardShell() {
    return (
        <div className="relative z-10 min-h-screen bg-neutral-950 text-white">
            
            <AppNav />

            <main
                className="
                    min-h-screen
                    pb-28
                    lg:pb-8
                    lg:pl-64
                "
            >
                <Outlet />
            </main>

        </div>
    );
}