"use client"

import { useEffect } from "react"
import { appBootstrap } from "@/offline/bootstrap/appBootstrap"
import { useAuthStore } from "@/store/useAuthStore"

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode
}) {

  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    appBootstrap()
  }, [])

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading application...
      </div>
    )
  }

  return <>{children}</>
}