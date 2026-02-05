"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useCallback } from "react"
import { useQuizStore } from "@/stores/quiz-store"

const SYNC_DEBOUNCE_MS = 2000 // Sync after 2 seconds of inactivity
const SYNC_VERSION_KEY = "sync-version"

export function useSync() {
  const { data: session, status } = useSession()
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncVersionRef = useRef<number>(0)
  const isSyncingRef = useRef(false)

  // Get the store state (excluding functions)
  const getStoreData = useCallback(() => {
    const state = useQuizStore.getState()
    return {
      documents: state.documents,
      quizzes: state.quizzes,
      progress: state.progress,
      passageLibrary: state.passageLibrary,
    }
  }, [])

  // Fetch remote data and merge with local
  const fetchAndMerge = useCallback(async () => {
    if (!session?.user?.id || isSyncingRef.current) return

    try {
      isSyncingRef.current = true
      const response = await fetch("/api/sync")

      if (!response.ok) {
        console.error("Failed to fetch sync data")
        return
      }

      const { data: remoteData, version: remoteVersion } = await response.json()

      if (!remoteData) {
        // No remote data, upload local data
        await uploadLocalData()
        return
      }

      const localVersion = parseInt(localStorage.getItem(SYNC_VERSION_KEY) || "0")

      if (remoteVersion > localVersion) {
        // Remote is newer, merge (remote wins for conflicts)
        const localData = getStoreData()
        const mergedData = mergeData(localData, remoteData)

        // Update local store
        const { setDocuments, setQuizzes, setUserProgress, setPassageLibrary } = useQuizStore.getState()

        if (mergedData.documents) setDocuments(mergedData.documents)
        if (mergedData.quizzes) setQuizzes(mergedData.quizzes)
        if (mergedData.progress) setUserProgress(mergedData.progress)
        if (mergedData.passageLibrary) setPassageLibrary(mergedData.passageLibrary)

        localStorage.setItem(SYNC_VERSION_KEY, remoteVersion.toString())
        lastSyncVersionRef.current = remoteVersion
      } else {
        // Local is newer or same, upload
        await uploadLocalData()
      }
    } catch (error) {
      console.error("Sync fetch error:", error)
    } finally {
      isSyncingRef.current = false
    }
  }, [session?.user?.id, getStoreData])

  // Upload local data to server
  const uploadLocalData = useCallback(async () => {
    if (!session?.user?.id || isSyncingRef.current) return

    try {
      isSyncingRef.current = true
      const data = getStoreData()

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      })

      if (response.ok) {
        const { version } = await response.json()
        localStorage.setItem(SYNC_VERSION_KEY, version.toString())
        lastSyncVersionRef.current = version
      }
    } catch (error) {
      console.error("Sync upload error:", error)
    } finally {
      isSyncingRef.current = false
    }
  }, [session?.user?.id, getStoreData])

  // Debounced sync
  const debouncedSync = useCallback(() => {
    if (!session?.user?.id) return

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      uploadLocalData()
    }, SYNC_DEBOUNCE_MS)
  }, [session?.user?.id, uploadLocalData])

  // Initial sync when user logs in
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchAndMerge()
    }
  }, [status, session?.user?.id, fetchAndMerge])

  // Sync on window focus
  useEffect(() => {
    if (!session?.user?.id) return

    const handleFocus = () => {
      fetchAndMerge()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [session?.user?.id, fetchAndMerge])

  // Subscribe to store changes
  useEffect(() => {
    if (!session?.user?.id) return

    const unsubscribe = useQuizStore.subscribe(() => {
      debouncedSync()
    })

    return () => {
      unsubscribe()
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [session?.user?.id, debouncedSync])

  return {
    isAuthenticated: !!session?.user?.id,
    syncNow: uploadLocalData,
  }
}

// Merge local and remote data
function mergeData(local: any, remote: any): any {
  const merged: any = {}

  // Merge documents (combine unique by id)
  const allDocs = [...(local.documents || []), ...(remote.documents || [])]
  const docsMap = new Map()
  allDocs.forEach(doc => docsMap.set(doc.id, doc))
  merged.documents = Array.from(docsMap.values())

  // Merge quizzes (combine unique by id)
  const allQuizzes = [...(local.quizzes || []), ...(remote.quizzes || [])]
  const quizzesMap = new Map()
  allQuizzes.forEach(quiz => quizzesMap.set(quiz.id, quiz))
  merged.quizzes = Array.from(quizzesMap.values())

  // Merge progress (keep higher values, combine arrays)
  const localProgress = local.progress || {}
  const remoteProgress = remote.progress || {}

  merged.progress = {
    ...localProgress,
    ...remoteProgress,
    totalQuestionsAnswered: Math.max(
      localProgress.totalQuestionsAnswered || 0,
      remoteProgress.totalQuestionsAnswered || 0
    ),
    totalQuizzesTaken: Math.max(
      localProgress.totalQuizzesTaken || 0,
      remoteProgress.totalQuizzesTaken || 0
    ),
    overallAccuracy: Math.max(
      localProgress.overallAccuracy || 0,
      remoteProgress.overallAccuracy || 0
    ),
    studyStreak: Math.max(
      localProgress.studyStreak || 0,
      remoteProgress.studyStreak || 0
    ),
    lastStudyDate: localProgress.lastStudyDate || remoteProgress.lastStudyDate,
    // Combine quiz history (unique by id)
    quizHistory: (() => {
      const allHistory = [...(localProgress.quizHistory || []), ...(remoteProgress.quizHistory || [])]
      const historyMap = new Map()
      allHistory.forEach(h => historyMap.set(h.id, h))
      return Array.from(historyMap.values())
    })(),
  }

  // Merge passage library (combine unique by id)
  const allPassages = [...(local.passageLibrary || []), ...(remote.passageLibrary || [])]
  const passagesMap = new Map()
  allPassages.forEach(p => passagesMap.set(p.id, p))
  merged.passageLibrary = Array.from(passagesMap.values())

  return merged
}
