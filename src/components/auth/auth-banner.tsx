"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Cloud, X } from "lucide-react"
import { AuthModal } from "./auth-modal"

const BANNER_DISMISSED_KEY = "auth-banner-dismissed"

export function AuthBanner() {
  const { data: session, status } = useSession()
  const [dismissed, setDismissed] = useState(true) // Start hidden to avoid flash
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed
    const wasDismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
    setDismissed(wasDismissed === "true")
  }, [])

  // Don't show if loading, logged in, or dismissed
  if (status === "loading" || session || dismissed) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true")
    setDismissed(true)
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Cloud className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-gray-700">
              <span className="hidden sm:inline">
                Connectez-vous pour sauvegarder votre progression et la retrouver sur tous vos appareils.
              </span>
              <span className="sm:hidden">
                Connectez-vous pour sauvegarder votre progression.
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Se connecter
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
