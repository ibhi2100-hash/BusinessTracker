"use client"
import DashboardLayout from "./(dashboard)/dashboard/layout";
import DashboardPage from "./(dashboard)/dashboard/page";
import { useEffect } from "react";
import { syncPendingSales } from "@/lib/sync";


export function OnlineListener(){
  useEffect(()=> {
    const handleOnline = ()=> {
      syncPendingSales();;
    };

    window.addEventListener("online", handleOnline);

    return ()=> {
      window.removeEventListener("online", handleOnline);
    };
  },[])

  return null
}



export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      
    </div>
  );
}
