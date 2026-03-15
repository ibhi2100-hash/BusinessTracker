"use client"

import { useEffect } from "react"
import { appBootstrap } from "@/offline/bootstrap/appBootstrap"
import { useAuthStore } from "@/store/useAuthStore"

export default function SessionInitializer({
  children,
}: {
  children: React.ReactNode
}) {
  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    if (!hydrated) {
      appBootstrap()
    }
  }, [hydrated])

  if (!hydrated) {
    return null
  }

  return <>{children}</>
}