import BottomNav from "@/components/navigation/BottomNav";
import React from "react";

export default function DashboardLayout({
    children
}:{
    children: React.ReactNode
}){
    return(
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 pb-20 px-4 pt-4">
                {children}
            </main>
            <BottomNav/>
        </div>
    )
}