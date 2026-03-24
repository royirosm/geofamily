// src/context/PlayerContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase 8A: pushPlayers() called (fire-and-forget) after every CRUD operation
//           so the Firestore players list stays current automatically.
//           useSync is imported and called inside the provider.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from 'react'
import { useSync } from '../hooks/useSync'

const PlayerContext = createContext(null)

const PROFILES_KEY = 'geofamily_players'
const ACTIVE_KEY   = 'geofamily_active_player'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveProfiles(profiles) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)) } catch {}
}

function loadActiveId() {
  try { return localStorage.getItem(ACTIVE_KEY) ?? null } catch { return null }
}

function saveActiveId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else    localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

export function PlayerProvider({ children }) {
  const [profiles, setProfiles] = useState(loadProfiles)
  const [activeId, setActiveId] = useState(loadActiveId)

  const { pushPlayers, pullAndMerge } = useSync()

  const activePlayer = profiles.find(p => p.id === activeId) ?? null

  // ── Pull on mount ─────────────────────────────────────────────────────────
  // Runs once when the app opens. Merges Firestore → localStorage, then
  // refreshes the in-memory profiles so the UI reflects the merged list.
  const syncOnOpen = useCallback(async () => {
    await pullAndMerge()
    // Re-read localStorage after merge (pullAndMerge wrote to it directly)
    const refreshed = loadProfiles()
    setProfiles(refreshed)
    // If the active player was deleted during merge, clear selection
    if (activeId && !refreshed.find(p => p.id === activeId)) {
      setActiveId(null)
      saveActiveId(null)
    }
  }, [pullAndMerge, activeId])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  function addPlayer(name, avatar, avatarBg, accentColor) {
    const newPlayer = {
      id:          crypto.randomUUID(),
      name:        name.trim(),
      avatar,
      avatarBg:    avatarBg    ?? 'bg-blue-400',
      accentColor: accentColor ?? 'blue',
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    const updated = [...profiles, newPlayer]
    setProfiles(updated)
    saveProfiles(updated)
    pushPlayers(updated)   // fire-and-forget
    return newPlayer
  }

  function updatePlayer(id, { name, avatar, avatarBg, accentColor }) {
    const updated = profiles.map(p =>
      p.id === id
        ? {
            ...p,
            name:        name?.trim()   ?? p.name,
            avatar:      avatar         ?? p.avatar,
            avatarBg:    avatarBg       ?? p.avatarBg,
            accentColor: accentColor    ?? p.accentColor,
            updatedAt:   new Date().toISOString(),
          }
        : p
    )
    setProfiles(updated)
    saveProfiles(updated)
    pushPlayers(updated)   // fire-and-forget
  }

  function removePlayer(id) {
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    saveProfiles(updated)
    if (activeId === id) { setActiveId(null); saveActiveId(null) }
    pushPlayers(updated)   // fire-and-forget
  }

  function switchPlayer(id) {
    setActiveId(id)
    saveActiveId(id)
  }

  function clearActivePlayer() {
    setActiveId(null)
    saveActiveId(null)
  }

  return (
    <PlayerContext.Provider value={{
      profiles, activePlayer, activeId,
      addPlayer, updatePlayer, removePlayer, switchPlayer, clearActivePlayer,
      syncOnOpen,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
