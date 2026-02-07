"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { User, LogOut, ChevronDown } from "lucide-react"
import { AuthModal } from "./auth-modal"

export function AuthButton() {
  const { data: session, status } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  if (status === "loading") {
    return (
      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <div className="relative w-full max-w-[200px]">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors p-2"
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {(session.user.name || session.user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 truncate flex-1 text-left">
            {session.user.name || session.user.email?.split("@")[0]}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false)
                  signOut()
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover transition-colors px-4 py-2 text-white text-sm font-medium"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Se connecter</span>
      </button>
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
