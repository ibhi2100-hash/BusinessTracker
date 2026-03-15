"use client"

import { useEffect, useState } from "react"
import { appBootstrap } from "@/offline/bootstrap/appBootstrap"

export default function AppBootstrap({
  children,
}: {
  children: React.ReactNode
}) {

  const [ready, setReady] = useState(false)

  useEffect(() => {

    async function init() {
      await appBootstrap()
      setReady(true)
    }

    init()

  }, [])

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return <>{children}</>
}