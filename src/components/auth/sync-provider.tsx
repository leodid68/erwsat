"use client"

import { useSync } from "@/hooks/useSync"
import { ReactNode } from "react"

export function SyncProvider({ children }: { children: ReactNode }) {
  // Initialize sync - this will handle syncing automatically
  useSync()

  return <>{children}</>
}
